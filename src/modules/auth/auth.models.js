const db_laundry = require('../../db/connection');
const config = require('../../config/config');

const TB = config?.tables?.TB_TICKETS || 'tb_tickets';

class AuthModels {
    createTicket = async (data) => {
        const [id] = await db_laundry(TB).insert(data);
        return this.getTicketById(id);
    };

    getTicketById = async (id) => {
        return await db_laundry(TB)
            .select(
                'id',
                'type',
                'phone',
                'code_hash',
                'password_hash',
                'attempts',
                'max_attempts',
                'expires_at',
                'status',
                'created_at'
            )
            .where({ id })
            .first();
    };

    getActiveTicket = async (phone, type) => {
        return await db_laundry(TB)
            .select(
                'id',
                'type',
                'phone',
                'code_hash',
                'password_hash',
                'attempts',
                'max_attempts',
                'expires_at',
                'status',
                'created_at'
            )
            .where({
                phone,
                type,
                status: 'pending',
            })
            .andWhere('expires_at', '>', db_laundry.fn.now())
            .orderBy('id', 'desc')
            .first();
    };

    increaseAttempts = async (id) => {
        return await db_laundry(TB)
            .where({ id })
            .increment('attempts', 1);
    };

    updateTicketStatus = async (id, status) => {
        return await db_laundry(TB)
            .where({ id })
            .update({ status });
    };

    expireTicket = async (id) => {
        return await db_laundry(TB)
            .where({ id })
            .update({ status: 'expired' });
    };

    consumeTicket = async (id) => {
        return await db_laundry(TB)
            .where({ id, status: 'pending' })
            .andWhere('expires_at', '>', db_laundry.fn.now())
            .update({ status: 'consumed' });
    };

    refreshTicketOtp = async (id, data) => {
        await db_laundry(TB)
            .where({ id, status: 'pending' })
            .update({
                code_hash: data.code_hash,
                attempts: data.attempts ?? 0,
                max_attempts: data.max_attempts ?? 5,
                expires_at: data.expires_at,
                status: data.status ?? 'pending',
            });

        return this.getTicketById(id);
    };
}

module.exports = new AuthModels();