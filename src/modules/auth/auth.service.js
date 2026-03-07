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
            const password = String(data.password || '').trim();

            const existingUser = await UserModels.getByPhone(phone);
            if (existingUser) {
                return {
                    success: false,
                    code: 'CONFLICT',
                    message: 'This phone number is already used',
                    data: {}
                };
            }

            const activeTicket = await AuthModels.getActiveTicket(phone, 'register');
            if (activeTicket) {
                return {
                    success: false,
                    code: 'ACTIVE_TICKET_EXISTS',
                    message: 'An active register ticket already exists',
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
            return {
                success: false,
                code: 'INTERNAL',
                message: 'Internal server error',
                data: {}
            };
        }
    };

    registerVerify = async (data) => {
        try {
            const ticket_id = Number(data.ticket_id);
            const code = String(data.code || '').trim();

            const ticket = await AuthModels.getTicketById(ticket_id);

            if (!ticket) {
                return {
                    success: false,
                    code: 'TICKET_NOT_FOUND',
                    message: 'Ticket does not exist',
                    data: {}
                };
            }

            if (ticket.type !== 'register') {
                return {
                    success: false,
                    code: 'INVALID_TICKET_TYPE',
                    message: 'Ticket type is not valid',
                    data: {}
                };
            }

            if (ticket.status !== 'pending') {
                return {
                    success: false,
                    code: 'TICKET_NOT_PENDING',
                    message: 'Ticket is not pending',
                    data: {}
                };
            }

            if (isExpired(ticket)) {
                await AuthModels.expireTicket(ticket_id);

                return {
                    success: false,
                    code: 'TICKET_EXPIRED',
                    message: 'Ticket has expired',
                    data: {}
                };
            }

            const attempts = Number(ticket.attempts ?? 0);
            const max_attempts = Number(ticket.max_attempts ?? authCfg.otpMaxAttempts);

            if (attempts >= max_attempts) {
                await AuthModels.expireTicket(ticket_id);

                return {
                    success: false,
                    code: 'TOO_MANY_ATTEMPTS',
                    message: 'Too many attempts',
                    data: {
                        attempts_left: 0
                    }
                };
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
                    code: 'INVALID_CODE',
                    message: 'Incorrect code',
                    data: {
                        attempts_left: Math.max(0, max_attempts - nextAttempts)
                    }
                };
            }

            const existingUser = await UserModels.getByPhone(ticket.phone);
            if (existingUser) {
                await AuthModels.consumeTicket(ticket_id);

                return {
                    success: false,
                    code: 'PHONE_ALREADY_USED',
                    message: 'Phone already used',
                    data: {}
                };
            }

            const createdUser = await UserModels.createUser({
                phone: ticket.phone,
                password_hash: ticket.password_hash
            });

            const user = createdUser?.data ?? createdUser;
            const user_id = user?.id;

            if (!user_id) {
                return {
                    success: false,
                    code: 'INTERNAL',
                    message: 'User was not created',
                    data: {}
                };
            }

            await AuthModels.consumeTicket(ticket_id);

            const access_token = jwt.sign(
                { sub: user_id, phone: user.phone },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            return {
                success: true,
                data: {
                    user,
                    access_token
                }
            };
        } catch (error) {
            if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
                const msg = String(error.sqlMessage || error.message || '').toLowerCase();

                if (msg.includes('phone')) {
                    return {
                        success: false,
                        code: 'PHONE_ALREADY_USED',
                        message: 'Phone already used',
                        data: {}
                    };
                }
            }

            return {
                success: false,
                code: 'INTERNAL',
                message: 'Internal server error',
                data: {}
            };
        }
    };

    loginStart = async (data) => {
        try {
            const phone = String(data.phone || '').trim();

            const user = await UserModels.getByPhone(phone);
            if (!user) {
                return {
                    success: false,
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    data: {}
                };
            }

            const activeTicket = await AuthModels.getActiveTicket(phone, 'login');
            if (activeTicket) {
                return {
                    success: false,
                    code: 'ACTIVE_TICKET_EXISTS',
                    message: 'An active login ticket already exists',
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

            console.log(`[LOGIN OTP] phone=${phone} code=${code} ticket_id=${ticket?.id}`);

            return {
                success: true,
                data: {
                    ticket_id: ticket?.id,
                    expires_at: ticket?.expires_at
                }
            };
        } catch (error) {
            return {
                success: false,
                code: 'INTERNAL',
                message: 'Internal server error',
                data: {}
            };
        }
    };

    loginVerify = async (data) => {
        try {
            const ticket_id = Number(data.ticket_id);
            const code = String(data.code || '').trim();

            const ticket = await AuthModels.getTicketById(ticket_id);

            if (!ticket) {
                return {
                    success: false,
                    code: 'TICKET_NOT_FOUND',
                    message: 'Ticket does not exist',
                    data: {}
                };
            }

            if (ticket.type !== 'login') {
                return {
                    success: false,
                    code: 'INVALID_TICKET_TYPE',
                    message: 'Ticket type is not valid',
                    data: {}
                };
            }

            if (ticket.status !== 'pending') {
                return {
                    success: false,
                    code: 'TICKET_NOT_PENDING',
                    message: 'Ticket is not pending',
                    data: {}
                };
            }

            if (isExpired(ticket)) {
                await AuthModels.expireTicket(ticket_id);

                return {
                    success: false,
                    code: 'TICKET_EXPIRED',
                    message: 'Ticket has expired',
                    data: {}
                };
            }

            const attempts = Number(ticket.attempts ?? 0);
            const max_attempts = Number(ticket.max_attempts ?? authCfg.otpMaxAttempts);

            if (attempts >= max_attempts) {
                await AuthModels.expireTicket(ticket_id);

                return {
                    success: false,
                    code: 'TOO_MANY_ATTEMPTS',
                    message: 'Too many attempts',
                    data: {
                        attempts_left: 0
                    }
                };
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
                    code: 'INVALID_CODE',
                    message: 'Incorrect code',
                    data: {
                        attempts_left: Math.max(0, max_attempts - nextAttempts)
                    }
                };
            }

            const user = await UserModels.getByPhone(ticket.phone);
            if (!user) {
                await AuthModels.consumeTicket(ticket_id);

                return {
                    success: false,
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    data: {}
                };
            }

            await AuthModels.consumeTicket(ticket_id);

            const access_token = jwt.sign(
                { sub: user.id, phone: user.phone },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            return {
                success: true,
                data: {
                    user,
                    access_token
                }
            };
        } catch (error) {
            return {
                success: false,
                code: 'INTERNAL',
                message: 'Internal server error',
                data: {}
            };
        }
    };

    resetPasswordStart = async (data) => {
        try {
            const phone = String(data.phone || '').trim();
            const new_password = String(data.new_password || '').trim();

            const user = await UserModels.getByPhone(phone);
            if (!user) {
                return {
                    success: false,
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    data: {}
                };
            }

            const activeTicket = await AuthModels.getActiveTicket(phone, 'reset_password');
            if (activeTicket) {
                return {
                    success: false,
                    code: 'ACTIVE_TICKET_EXISTS',
                    message: 'An active reset password ticket already exists',
                    data: {
                        ticket_id: activeTicket.id,
                        expires_at: activeTicket.expires_at
                    }
                };
            }

            const code = generateOtp();

            const [code_hash, password_hash] = await Promise.all([
                bcrypt.hash(code, authCfg.bcryptCost),
                bcrypt.hash(new_password, authCfg.bcryptCost)
            ]);

            const ticket = await AuthModels.createTicket({
                type: 'reset_password',
                phone,
                code_hash,
                password_hash,
                attempts: 0,
                max_attempts: authCfg.otpMaxAttempts,
                expires_at: computeExpiresAt(),
                status: 'pending'
            });

            console.log(`[RESET OTP] phone=${phone} code=${code} ticket_id=${ticket?.id}`);

            return {
                success: true,
                data: {
                    ticket_id: ticket?.id,
                    expires_at: ticket?.expires_at
                }
            };
        } catch (error) {
            return {
                success: false,
                code: 'INTERNAL',
                message: 'Internal server error',
                data: {}
            };
        }
    };

    resetPasswordVerify = async (data) => {
        try {
            const ticket_id = Number(data.ticket_id);
            const code = String(data.code || '').trim();

            const ticket = await AuthModels.getTicketById(ticket_id);

            if (!ticket) {
                return {
                    success: false,
                    code: 'TICKET_NOT_FOUND',
                    message: 'Ticket does not exist',
                    data: {}
                };
            }

            if (ticket.type !== 'reset_password') {
                return {
                    success: false,
                    code: 'INVALID_TICKET_TYPE',
                    message: 'Ticket type is not valid',
                    data: {}
                };
            }

            if (ticket.status !== 'pending') {
                return {
                    success: false,
                    code: 'TICKET_NOT_PENDING',
                    message: 'Ticket is not pending',
                    data: {}
                };
            }

            if (isExpired(ticket)) {
                await AuthModels.expireTicket(ticket_id);

                return {
                    success: false,
                    code: 'TICKET_EXPIRED',
                    message: 'Ticket has expired',
                    data: {}
                };
            }

            const attempts = Number(ticket.attempts ?? 0);
            const max_attempts = Number(ticket.max_attempts ?? authCfg.otpMaxAttempts);

            if (attempts >= max_attempts) {
                await AuthModels.expireTicket(ticket_id);

                return {
                    success: false,
                    code: 'TOO_MANY_ATTEMPTS',
                    message: 'Too many attempts',
                    data: {
                        attempts_left: 0
                    }
                };
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
                    code: 'INVALID_CODE',
                    message: 'Incorrect code',
                    data: {
                        attempts_left: Math.max(0, max_attempts - nextAttempts)
                    }
                };
            }

            const user = await UserModels.getByPhone(ticket.phone);
            if (!user) {
                await AuthModels.consumeTicket(ticket_id);

                return {
                    success: false,
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    data: {}
                };
            }

            const updatedUser = await UserModels.changePassword(user.id, ticket.password_hash);
            if (!updatedUser) {
                return {
                    success: false,
                    code: 'PASSWORD_NOT_UPDATED',
                    message: 'Password was not updated',
                    data: {}
                };
            }

            await AuthModels.consumeTicket(ticket_id);

            return {
                success: true,
                data: {
                    user: updatedUser
                }
            };
        } catch (error) {
            return {
                success: false,
                code: 'INTERNAL',
                message: 'Internal server error',
                data: {}
            };
        }
    };

    resendOtp = async (data) => {
        try {
            const ticket_id = Number(data.ticket_id);

            const ticket = await AuthModels.getTicketById(ticket_id);

            if (!ticket) {
                return {
                    success: false,
                    code: 'TICKET_NOT_FOUND',
                    message: 'Ticket does not exist',
                    data: {}
                };
            }

            if (ticket.status !== 'pending') {
                return {
                    success: false,
                    code: 'TICKET_NOT_PENDING',
                    message: 'Only pending ticket can be resent',
                    data: {}
                };
            }

            if (isExpired(ticket)) {
                await AuthModels.expireTicket(ticket_id);

                return {
                    success: false,
                    code: 'TICKET_EXPIRED',
                    message: 'Ticket has expired',
                    data: {}
                };
            }

            const code = generateOtp();
            const code_hash = await bcrypt.hash(code, authCfg.bcryptCost);

            const updatedTicket = await AuthModels.refreshTicketOtp(ticket.id, {
                code_hash,
                attempts: 0,
                max_attempts: authCfg.otpMaxAttempts,
                expires_at: computeExpiresAt(),
                status: 'pending'
            });

            console.log(`[RESEND OTP] phone=${ticket.phone} type=${ticket.type} code=${code} ticket_id=${ticket.id}`);

            return {
                success: true,
                data: {
                    ticket_id: updatedTicket?.id ?? ticket.id,
                    expires_at: updatedTicket?.expires_at
                }
            };
        } catch (error) {
            return {
                success: false,
                code: 'INTERNAL',
                message: 'Internal server error',
                data: {}
            };
        }
    };
}

module.exports = new AuthService();