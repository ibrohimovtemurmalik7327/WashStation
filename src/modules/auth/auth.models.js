const db = require('../../db/connection');
const config = require('../../config/config');

const TB_USERS = config.tables?.TB_USERS || 'tb_users';
const TB_TICKETS = config.tables?.TB_TICKETS || 'tb_tickets';

class AuthModels {

    createTicket = async (data, trx = db) => {
        const [id] = await trx(TB_TICKETS).insert(data);
        return this.getTicketById(id, trx);
    };

    getTicketById = async (id, trx = db) => {
        const ticket = await trx(TB_TICKETS)
            .where({ id })
            .first();

        return ticket || null;
    };

    getPendingTicketByPhoneAndType = async (phone, type, trx = db) => {
        const ticket = await trx(TB_TICKETS)
            .where({
                phone,
                type,
                status: 'pending'
            })
            .orderBy('id', 'desc')
            .first();

        return ticket || null;
    };

    incrementAttempts = async (id, trx = db) => {
        const affected = await trx(TB_TICKETS)
            .where({ id })
            .increment('attempts', 1);

        return affected > 0;
    };

    expireTicket = async (id, trx = db) => {
        const affected = await trx(TB_TICKETS)
            .where({ id })
            .update({
                status: 'expired'
            });

        return affected > 0;
    };

    consumeTicket = async (id, trx = db) => {
        const affected = await trx(TB_TICKETS)
            .where({
                id,
                status: 'pending'
            })
            .update({
                status: 'consumed'
            });

        return affected > 0;
    };

    createUser = async (data, trx = db) => {
        const [id] = await trx(TB_USERS).insert(data);
        return this.getUserById(id, trx);
    };

    getUserByPhone = async (phone, trx = db) => {
        const user = await trx(TB_USERS)
            .where({ phone })
            .first();

        return user || null;
    };

    getUserByUsername = async (username, trx = db) => {
        const user = await trx(TB_USERS)
            .where({ username })
            .first();

        return user || null;
    };

    getUserById = async (id, trx = db) => {
        const user = await trx(TB_USERS)
            .where({ id })
            .first();

        return user || null;
    };

    updateUserPassword = async (id, password_hash, trx = db) => {
        const affected = await trx(TB_USERS)
            .where({ id })
            .update({
                password_hash,
                updated_at: trx.fn.now()
            });

        return affected > 0;
    };
}

module.exports = new AuthModels();