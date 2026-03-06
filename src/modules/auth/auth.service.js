const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AuthModels = require('./auth.models');
const UserModels = require('../user/user.models');
const config = require('../../config/config');

const { authCfg } = require('./helpers/auth.config');
const { generateOtp, computeExpiresAt } = require('./helpers/otp.helper');
const { isExpired, attemptsLeft } = require('./helpers/ticket.helper');

class AuthService {
    registerStart = async (data) => {
        try {
            const { phone, password } = data;
            const doesExist = UserModels.getByPhone(phone);
            if(doesExist) {
                return {
                    success: false,
                    code: 'CONFLICT',
                    message: 'This phone number already used'
                };
            };

            const activeTicket = await AuthModels.getActiveTicket(phone, 'register');
            if(activeTicket) {
                return {
                    success: false,
                    code: 'ACTIVE_TICKET_EXISTS',
                    message: 'Active ticket should be used'
                };
            };

            const code = generateOtp();

            const [code_hash, password_hash] = await Promise.all([
                bcrypt.hash(code, authCfg.bcryptCost),
                bcrypt.hash(password, authCfg.bcryptCost)
            ]);

            const ticket = await AuthModels.createTicket({
                type: 'register',
                phone,
                code_hash,
                attempts: 0,
                expires_at: computeExpiresAt(),
                status: 'pending',
                created_at: new Date()
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
                code: 'INTERNAL'
            };
        }
    };
    
    registerVerify = async (data) => {
        try {
            const { ticket_id, code } = data;

            const ticket = await AuthModels.getTicketById(ticket_id);

            if(!ticket) {
                return {
                    success: false,
                    code: 'TICKET_NOT_FOUND',
                    message: 'Ticket doesnt exist'
                };
            };

            if(ticket.type !== register) {
                return {
                    success: false,
                    code: 'INVALID_TICKET_TYPE',
                    message: 'Ticket type is not valid'
                };
            };

            if(ticket.status !== 'pending') {
                return {
                    success: false,
                    code: 'TICKET_NOT_PENDING',
                    message: 'Ticket status is not pending'
                };
            };

            if(isExpired(ticket)) {
                await AuthModels.expireTicket(ticket_id);
                return {
                    success: false,
                    code: 'TICKET_EXPIRED'
                };
            };

            const attempts = Number(ticket.attempts ?? 0);
            const max_attempts = Number(ticket.max_attempts ?? 5);

            if(attempts >= max_attempts) {
                await AuthModels.expireTicket(ticket_id);
                return {
                    success: false,
                    code: 'TOO_MANY_ATTEMPTS'
                };
            };

            const ok = await bcrypt.compare(String(code).trim(), String(ticket.code_hash));

            if(!ok) {
                await AuthModels.increaseAttempts(ticket_id);

                const left = Math.max(0, max_attempts - (attempts + 1));
                if (attempts + 1 >= max_attempts) await AuthModels.expireTicket(ticket_id);

                return { success: false, code: 'INVALID_CODE', message: 'Incorrect code' };
            };

            const 
        }
    }
}