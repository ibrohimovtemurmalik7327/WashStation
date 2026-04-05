const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const db = require('../../db/connection');
const config = require('../../config/config');
const AuthModels = require('./auth.models');

const BCRYPT_COST = Number(config.bcrypt?.cost || 10);
const JWT_SECRET = config.jwt?.secret || 'super_secret_key';
const JWT_EXPIRES_IN = config.jwt?.expiresIn || '1h';

const OTP_LENGTH = Number(config.otp?.length || 6);
const OTP_TTL_MS = Number(config.otp?.ttlMs || 5 * 60 * 1000);
const OTP_MAX_ATTEMPTS = Number(config.otp?.maxAttempts || 5);

class AuthService {
    generateOtp = () => {
        const min = 10 ** (OTP_LENGTH - 1);
        const max = (10 ** OTP_LENGTH) - 1;
        return String(crypto.randomInt(min, max + 1));
    };

    generateAccessToken = (user) => {
        return jwt.sign(
            {
                sub: user.id,
                phone: user.phone,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    };

    isExpired = (expiresAt) => {
        return new Date(expiresAt).getTime() < Date.now();
    };

    sanitizeUser = (user) => {
        if (!user) return null;

        return {
            id: user.id,
            username: user.username,
            phone: user.phone,
            role: user.role,
            status: user.status,
            created_at: user.created_at,
            updated_at: user.updated_at
        };
    };

    registerStart = async (data) => {
        try {
            const { username, phone, password } = data;

            const byPhone = await AuthModels.getUserByPhone(phone);
            if (byPhone) {
                return {
                    success: false,
                    error: 'PHONE_CONFLICT',
                    data: {}
                };
            }

            const byUsername = await AuthModels.getUserByUsername(username);
            if (byUsername) {
                return {
                    success: false,
                    error: 'USERNAME_CONFLICT',
                    data: {}
                };
            }

            const activeTicket = await AuthModels.getPendingTicketByPhoneAndType(phone, 'register');
            if (activeTicket) {
                if (this.isExpired(activeTicket.expires_at)) {
                    await AuthModels.expireTicket(activeTicket.id);
                } else {
                    return {
                        success: false,
                        error: 'ACTIVE_TICKET_EXISTS',
                        data: {
                            ticket_id: activeTicket.id,
                            expires_at: activeTicket.expires_at
                        }
                    };
                }
            }

            const otp = this.generateOtp();
            const code_hash = await bcrypt.hash(otp, BCRYPT_COST);
            const password_hash = await bcrypt.hash(password, BCRYPT_COST);
            const expires_at = new Date(Date.now() + OTP_TTL_MS);

            const ticket = await AuthModels.createTicket({
                type: 'register',
                username,
                phone,
                code_hash,
                password_hash,
                attempts: 0,
                max_attempts: OTP_MAX_ATTEMPTS,
                expires_at,
                status: 'pending'
            });

            console.log(`REGISTER OTP for ${phone}: ${otp}`);

            return {
                success: true,
                data: {
                    ticket_id: ticket.id,
                    expires_at: ticket.expires_at
                }
            };
        } catch (error) {
            console.error('AuthService.registerStart error:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message?.includes('username')) {
                    return {
                        success: false,
                        error: 'USERNAME_CONFLICT',
                        data: {}
                    };
                }

                if (error.message?.includes('phone')) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT',
                        data: {}
                    };
                }

                return {
                    success: false,
                    error: 'CONFLICT',
                    data: {}
                };
            }

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    registerVerify = async (data) => {
        try {
            const { ticket_id, code } = data;

            const ticket = await AuthModels.getTicketById(ticket_id);
            if (!ticket) {
                return {
                    success: false,
                    error: 'TICKET_NOT_FOUND',
                    data: {}
                };
            }

            if (ticket.type !== 'register') {
                return {
                    success: false,
                    error: 'BAD_REQUEST',
                    data: {}
                };
            }

            if (ticket.status !== 'pending') {
                return {
                    success: false,
                    error: 'TICKET_NOT_PENDING',
                    data: {}
                };
            }

            if (this.isExpired(ticket.expires_at)) {
                await AuthModels.expireTicket(ticket.id);

                return {
                    success: false,
                    error: 'TICKET_EXPIRED',
                    data: {}
                };
            }

            if (ticket.attempts >= ticket.max_attempts) {
                await AuthModels.expireTicket(ticket.id);

                return {
                    success: false,
                    error: 'TOO_MANY_ATTEMPTS',
                    data: {}
                };
            }

            const isMatch = await bcrypt.compare(String(code).trim(), String(ticket.code_hash));
            if (!isMatch) {
                await AuthModels.incrementAttempts(ticket.id);

                const nextAttempts = Number(ticket.attempts) + 1;
                if (nextAttempts >= Number(ticket.max_attempts)) {
                    await AuthModels.expireTicket(ticket.id);
                }

                return {
                    success: false,
                    error: 'INVALID_CODE',
                    data: {
                        attempts_left: Math.max(0, Number(ticket.max_attempts) - nextAttempts)
                    }
                };
            }

            const result = await db.transaction(async (trx) => {
                const phoneExists = await AuthModels.getUserByPhone(ticket.phone, trx);
                if (phoneExists) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT',
                        data: {}
                    };
                }

                const usernameExists = await AuthModels.getUserByUsername(ticket.username, trx);
                if (usernameExists) {
                    return {
                        success: false,
                        error: 'USERNAME_CONFLICT',
                        data: {}
                    };
                }

                const user = await AuthModels.createUser({
                    username: ticket.username,
                    phone: ticket.phone,
                    password_hash: ticket.password_hash,
                    role: 'user',
                    status: 'active'
                }, trx);

                const consumed = await AuthModels.consumeTicket(ticket.id, trx);
                if (!consumed) {
                    throw new Error('Failed to consume register ticket');
                }

                const token = this.generateAccessToken(user);

                return {
                    success: true,
                    data: {
                        user: this.sanitizeUser(user),
                        token
                    }
                };
            });

            return result;
        } catch (error) {
            console.error('AuthService.registerVerify error:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message?.includes('phone')) {
                    return {
                        success: false,
                        error: 'PHONE_CONFLICT',
                        data: {}
                    };
                }

                if (error.message?.includes('username')) {
                    return {
                        success: false,
                        error: 'USERNAME_CONFLICT',
                        data: {}
                    };
                }

                return {
                    success: false,
                    error: 'CONFLICT',
                    data: {}
                };
            }

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    login = async (data) => {
        try {
            const { phone, password } = data;

            const user = await AuthModels.getUserByPhone(phone);
            if (!user) {
                return {
                    success: false,
                    error: 'INVALID_CREDENTIALS',
                    data: {}
                };
            }

            if (user.status !== 'active') {
                return {
                    success: false,
                    error: 'USER_INACTIVE',
                    data: {}
                };
            }

            const ok = await bcrypt.compare(password, user.password_hash);
            if (!ok) {
                return {
                    success: false,
                    error: 'INVALID_CREDENTIALS',
                    data: {}
                };
            }

            const token = this.generateAccessToken(user);

            return {
                success: true,
                data: {
                    user: this.sanitizeUser(user),
                    token
                }
            };
        } catch (error) {
            console.error('AuthService.login error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    changePassword = async (userId, data) => {
        try {
            const { oldPassword, newPassword } = data;

            const user = await AuthModels.getUserById(userId);
            if (!user) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    data: {}
                };
            }

            if (user.status !== 'active') {
                return {
                    success: false,
                    error: 'USER_INACTIVE',
                    data: {}
                };
            }

            const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password_hash);
            if (!isOldPasswordCorrect) {
                return {
                    success: false,
                    error: 'INCORRECT_PASSWORD',
                    data: {}
                };
            }

            const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
            if (isSamePassword) {
                return {
                    success: false,
                    error: 'SAME_PASSWORD',
                    data: {}
                };
            }

            const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
            const updated = await AuthModels.updateUserPassword(user.id, newPasswordHash);

            if (!updated) {
                return {
                    success: false,
                    error: 'INTERNAL_ERROR',
                    data: {}
                };
            }

            return {
                success: true,
                data: {}
            };
        } catch (error) {
            console.error('AuthService.changePassword error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    forgotPasswordStart = async (data) => {
        try {
            const { phone } = data;

            const user = await AuthModels.getUserByPhone(phone);
            if (!user) {
                return {
                    success: false,
                    error: 'USER_NOT_FOUND',
                    data: {}
                };
            }

            if (user.status !== 'active') {
                return {
                    success: false,
                    error: 'USER_INACTIVE',
                    data: {}
                };
            }

            const activeTicket = await AuthModels.getPendingTicketByPhoneAndType(phone, 'reset_password');
            if (activeTicket) {
                if (this.isExpired(activeTicket.expires_at)) {
                    await AuthModels.expireTicket(activeTicket.id);
                } else {
                    return {
                        success: false,
                        error: 'ACTIVE_TICKET_EXISTS',
                        data: {
                            ticket_id: activeTicket.id,
                            expires_at: activeTicket.expires_at
                        }
                    };
                }
            }

            const otp = this.generateOtp();
            const code_hash = await bcrypt.hash(otp, BCRYPT_COST);
            const expires_at = new Date(Date.now() + OTP_TTL_MS);

            const ticket = await AuthModels.createTicket({
                type: 'reset_password',
                username: null,
                phone,
                code_hash,
                password_hash: null,
                attempts: 0,
                max_attempts: OTP_MAX_ATTEMPTS,
                expires_at,
                status: 'pending'
            });

            console.log(`RESET PASSWORD OTP for ${phone}: ${otp}`);

            return {
                success: true,
                data: {
                    ticket_id: ticket.id,
                    expires_at: ticket.expires_at
                }
            };
        } catch (error) {
            console.error('AuthService.forgotPasswordStart error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };

    forgotPasswordVerify = async (data) => {
        try {
            const { ticket_id, code, newPassword } = data;

            const ticket = await AuthModels.getTicketById(ticket_id);
            if (!ticket) {
                return {
                    success: false,
                    error: 'TICKET_NOT_FOUND',
                    data: {}
                };
            }

            if (ticket.type !== 'reset_password') {
                return {
                    success: false,
                    error: 'BAD_REQUEST',
                    data: {}
                };
            }

            if (ticket.status !== 'pending') {
                return {
                    success: false,
                    error: 'TICKET_NOT_PENDING',
                    data: {}
                };
            }

            if (this.isExpired(ticket.expires_at)) {
                await AuthModels.expireTicket(ticket.id);

                return {
                    success: false,
                    error: 'TICKET_EXPIRED',
                    data: {}
                };
            }

            if (ticket.attempts >= ticket.max_attempts) {
                await AuthModels.expireTicket(ticket.id);

                return {
                    success: false,
                    error: 'TOO_MANY_ATTEMPTS',
                    data: {}
                };
            }

            const isMatch = await bcrypt.compare(String(code).trim(), String(ticket.code_hash));
            if (!isMatch) {
                await AuthModels.incrementAttempts(ticket.id);

                const nextAttempts = Number(ticket.attempts) + 1;
                if (nextAttempts >= Number(ticket.max_attempts)) {
                    await AuthModels.expireTicket(ticket.id);
                }

                return {
                    success: false,
                    error: 'INVALID_CODE',
                    data: {
                        attempts_left: Math.max(0, Number(ticket.max_attempts) - nextAttempts)
                    }
                };
            }

            const result = await db.transaction(async (trx) => {
                const user = await AuthModels.getUserByPhone(ticket.phone, trx);
                if (!user) {
                    return {
                        success: false,
                        error: 'USER_NOT_FOUND',
                        data: {}
                    };
                }

                if (user.status !== 'active') {
                    return {
                        success: false,
                        error: 'USER_INACTIVE',
                        data: {}
                    };
                }

                const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
                if (isSamePassword) {
                    return {
                        success: false,
                        error: 'SAME_PASSWORD',
                        data: {}
                    };
                }

                const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_COST);

                const updated = await AuthModels.updateUserPassword(user.id, newPasswordHash, trx);
                if (!updated) {
                    throw new Error('Failed to update password');
                }

                const consumed = await AuthModels.consumeTicket(ticket.id, trx);
                if (!consumed) {
                    throw new Error('Failed to consume reset password ticket');
                }

                return {
                    success: true,
                    data: {}
                };
            });

            return result;
        } catch (error) {
            console.error('AuthService.forgotPasswordVerify error:', error);

            return {
                success: false,
                error: 'INTERNAL_ERROR',
                data: {}
            };
        }
    };
}

module.exports = new AuthService();