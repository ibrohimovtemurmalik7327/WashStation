const db_laundry = require('../../db/connection');
const config = require('../../config/config');

const TB = config?.tables?.TB_TICKETS || 'tb_tickets';

class AuthModels {
    createTicket = async(data) => {
        const [id] = await db_laundry(TB)
        .insert(data);

        return this.getTicketById(id);
    };

    getTicketById = async(id) => {
        return await db_laundry(TB)
        .select('id', 'type', 'phone', 'status', 'expired_at')
        .where({ id })
        .first();
    };

    getActiveTicket = async(phone, type) => {
        return await db_laundry(TB)
        .where({
            phone,
            type,
            status: 'pending'
        }).first();
    };

    increaseAttempts = async(id) => {
        return db_laundry(TB)
        .where({ id })
        .increment('attempts', 1);
    };

    updateTicketStatus = async(id, status) => {
        return db_laundry(TB)
        .where({ id })
        .update({ status });
    };

    expireTicket = async(id) => {
        return db_laundry(TB)
        .where({ id })
        .update({ status: 'expired' });
    };
};

module.exports = new AuthModels();
