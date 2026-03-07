const db_laundry = require('../../db/connection');
const config = require('../../config/config');

const TB = config?.tables?.TB_USERS || 'tb_users';

class UserModels {
    createUser = async (data) => {
        const [id] = await db_laundry(TB).insert(data);
        return this.getUserById(id);
    };

    getUserById = async (id) => {
        return await db_laundry(TB)
            .select('id', 'phone', 'role', 'created_at', 'updated_at')
            .where({ id })
            .first();
    };

    getUsers = async () => {
        return await db_laundry(TB)
            .select('id', 'phone', 'role', 'created_at', 'updated_at');
    };

    getByPhone = async (phone) => {
        return await db_laundry(TB)
            .select('id', 'phone', 'role', 'created_at', 'updated_at')
            .where({ phone })
            .first();
    };

    getPasswordHashById = async (id) => {
        const result = await db_laundry(TB)
            .select('password_hash')
            .where({ id })
            .first();

        return result?.password_hash || null;
    };

    updateById = async (id, data) => {
        await db_laundry(TB)
            .where({ id })
            .update({
                ...data,
                updated_at: db_laundry.fn.now(),
            });

        return this.getUserById(id);
    };

    changePassword = async (id, password_hash) => {
        await db_laundry(TB)
            .where({ id })
            .update({
                password_hash,
                updated_at: db_laundry.fn.now(),
            });

        return this.getUserById(id);
    };

    deleteById = async (id) => {
        return await db_laundry(TB)
            .where({ id })
            .del();
    };
}

module.exports = new UserModels();