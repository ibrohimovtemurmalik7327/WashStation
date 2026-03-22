const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AuthModels = require('./auth.models');
const UserModels = require('../user/user.models');
const config = require('../../config/config');

const { authCfg } = require('./helpers/auth.config');
const { generateOtp, computeExpiresAt } = require('./helpers/otp.helper');
const { isExpired } = require('./helpers/ticket.helper');

class AuthService {

    registerStart = async (data) => {
        try {
            const phone = String(data.phone || '').trim();
            const password = String(data.password || '');

            const existingUser = await UserModels.getByPhone(phone);
            if (existingUser) {
                return { success: false, error: 'CONFLICT', data: {} };
            }

            const activeTicket = await AuthModels.getActiveTicket(phone, 'register');
            if (activeTicket) {
                return {
                    success: false,
                    error: 'ACTIVE_TICKET_EXISTS',
                    data: {
                        ticket_id: activeTicket.id,
                        expires_at: activeTicket.expires_at
                    }
                };
            }

            const code = generateOtp();

            const [code_hash, password_hash] = await Promise.all([
                bcrypt.hash(code, authCfg.bcryptCost),
                bcrypt.hash(password, authCfg.bcryptCost)
            ]);

            const ticket = await AuthModels.createTicket({
                type: 'register',
                phone,
                code_hash,
                password_hash,
                attempts: 0,
                max_attempts: authCfg.otpMaxAttempts,
                expires_at: computeExpiresAt(),
                status: 'pending'
            });

            console.log(`[REGISTER OTP] phone=${phone} code=${code} ticket_id=${ticket?.id}`);

            return {
                success: true,
                data: {
                    ticket_id: ticket?.id,
                    expires_at: ticket?.expires_at
                }
            };
        } catch (error) {
            console.error('registerStart error:', error);
            return { success: false, error: 'INTERNAL', data: {} };
        }
    };

    registerVerify = async (data) => {
        try {
            const ticket_id = Number(data.ticket_id);
            const code = String(data.code || '').trim();

            const ticket = await AuthModels.getTicketById(ticket_id);

            if (!ticket) return { success: false, error: 'TICKET_NOT_FOUND', data: {} };
            if (ticket.type !== 'register') return { success: false, error: 'INVALID_TICKET_TYPE', data: {} };
            if (ticket.status !== 'pending') return { success: false, error: 'TICKET_NOT_PENDING', data: {} };

            if (isExpired(ticket)) {
                await AuthModels.expireTicket(ticket_id);
                return { success: false, error: 'TICKET_EXPIRED', data: {} };
            }

            const attempts = Number(ticket.attempts ?? 0);
            const max_attempts = Number(ticket.max_attempts ?? authCfg.otpMaxAttempts);

            if (attempts >= max_attempts) {
                await AuthModels.expireTicket(ticket_id);
                return { success: false, error: 'TOO_MANY_ATTEMPTS', data: { attempts_left: 0 } };
            }

            const ok = await bcrypt.compare(code, String(ticket.code_hash));

            if (!ok) {
                const nextAttempts = attempts + 1;
                await AuthModels.increaseAttempts(ticket_id);

                if (nextAttempts >= max_attempts) {
                    await AuthModels.expireTicket(ticket_id);
                }

                return {
                    success: false,
                    error: 'INVALID_CODE',
                    data: { attempts_left: Math.max(0, max_attempts - nextAttempts) }
                };
            }

            const existingUser = await UserModels.getByPhone(ticket.phone);
            if (existingUser) {
                await AuthModels.consumeTicket(ticket_id);
                return { success: false, error: 'PHONE_ALREADY_USED', data: {} };
            }

            const user = await UserModels.createUser({
                phone: ticket.phone,
                password_hash: ticket.password_hash
            });

            if (!user?.id) return { success: false, error: 'INTERNAL', data: {} };

            await AuthModels.consumeTicket(ticket_id);

            const access_token = jwt.sign(
                { sub: user.id, phone: user.phone, role: user.role },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            return {
                success: true,
                data: { user, access_token }
            };
        } catch (error) {
            console.error('registerVerify error:', error);

            if (error?.code === 'ER_DUP_ENTRY') {
                return { success: false, error: 'PHONE_ALREADY_USED', data: {} };
            }

            return { success: false, error: 'INTERNAL', data: {} };
        }
    };

    loginStart = async (data) => {
        try {
            const phone = String(data.phone || '').trim();

            const user = await UserModels.getByPhone(phone);
            if (!user) return { success: false, error: 'USER_NOT_FOUND', data: {} };

            const activeTicket = await AuthModels.getActiveTicket(phone, 'login');
            if (activeTicket) {
                return {
                    success: false,
                    error: 'ACTIVE_TICKET_EXISTS',
                    data: {
                        ticket_id: activeTicket.id,
                        expires_at: activeTicket.expires_at
                    }
                };
            }

            const code = generateOtp();
            const code_hash = await bcrypt.hash(code, authCfg.bcryptCost);

            const ticket = await AuthModels.createTicket({
                type: 'login',
                phone,
                code_hash,
                attempts: 0,
                max_attempts: authCfg.otpMaxAttempts,
                expires_at: computeExpiresAt(),
                status: 'pending'
            });

            console.log(`[LOGIN OTP] phone=${phone} code=${code}`);

            return {
                success: true,
                data: {
                    ticket_id: ticket?.id,
                    expires_at: ticket?.expires_at
                }
            };
        } catch (error) {
            console.error('loginStart error:', error);
            return { success: false, error: 'INTERNAL', data: {} };
        }
    };

    loginVerify = async (data) => {
        try {
            const ticket = await AuthModels.getTicketById(Number(data.ticket_id));

            if (!ticket) return { success: false, error: 'TICKET_NOT_FOUND', data: {} };
            if (ticket.type !== 'login') return { success: false, error: 'INVALID_TICKET_TYPE', data: {} };
            if (ticket.status !== 'pending') return { success: false, error: 'TICKET_NOT_PENDING', data: {} };

            if (isExpired(ticket)) {
                await AuthModels.expireTicket(ticket.id);
                return { success: false, error: 'TICKET_EXPIRED', data: {} };
            }

            const ok = await bcrypt.compare(data.code, ticket.code_hash);

            if (!ok) {
                await AuthModels.increaseAttempts(ticket.id);
                return { success: false, error: 'INVALID_CODE', data: {} };
            }

            const user = await UserModels.getByPhone(ticket.phone);
            if (!user) return { success: false, error: 'USER_NOT_FOUND', data: {} };

            await AuthModels.consumeTicket(ticket.id);

            const access_token = jwt.sign(
                { sub: user.id, phone: user.phone, role: user.role },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            return { success: true, data: { user, access_token } };
        } catch (error) {
            console.error('loginVerify error:', error);
            return { success: false, error: 'INTERNAL', data: {} };
        }
    };

    resetPasswordStart = async (data) => {
        try {
            const phone = String(data.phone || '').trim();

            const user = await UserModels.getByPhone(phone);
            if (!user) return { success: false, error: 'USER_NOT_FOUND', data: {} };

            const code = generateOtp();
            const code_hash = await bcrypt.hash(code, authCfg.bcryptCost);

            const ticket = await AuthModels.createTicket({
                type: 'reset_password',
                phone,
                code_hash,
                attempts: 0,
                max_attempts: authCfg.otpMaxAttempts,
                expires_at: computeExpiresAt(),
                status: 'pending'
            });

            return {
                success: true,
                data: {
                    ticket_id: ticket?.id,
                    expires_at: ticket?.expires_at
                }
            };
        } catch (error) {
            return { success: false, error: 'INTERNAL', data: {} };
        }
    };

    resendOtp = async (data) => {
        try {
            const ticket = await AuthModels.getTicketById(Number(data.ticket_id));

            if (!ticket) return { success: false, error: 'TICKET_NOT_FOUND', data: {} };

            const code = generateOtp();
            const code_hash = await bcrypt.hash(code, authCfg.bcryptCost);

            await AuthModels.refreshTicketOtp(ticket.id, {
                code_hash,
                attempts: 0,
                max_attempts: authCfg.otpMaxAttempts,
                expires_at: computeExpiresAt(),
                status: 'pending'
            });

            return {
                success: true,
                data: {
                    ticket_id: ticket.id,
                    expires_at: computeExpiresAt()
                }
            };
        } catch (error) {
            return { success: false, error: 'INTERNAL', data: {} };
        }
    };
}

module.exports = new AuthService();