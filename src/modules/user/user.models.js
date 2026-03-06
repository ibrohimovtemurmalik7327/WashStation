const db_laundry = require('../../db/connection');
const config = require('../../config/config');

const TB = config?.tables?.TB_USERS || 'tb_users';

class UserModels {
    createUser = async (data) => {
        const [id] = await db_laundry(TB)
        .insert(data);

        return this.getUserById(id);
    };

    getUserById = async (id) => {
        const result = await db_laundry(TB)
        .select('id', 'phone', 'role', 'created_at', 'updated_at')
        .where({id})
        .first();

        return result;
    };

    getUsers = async () => {
        const users = await db_laundry(TB)
        .select('id', 'phone', 'role', 'created_at', 'updated_at');

        return users;
    }

    getByPhone = async (phone) => {
        const result = await db_laundry(TB)
        .select('id', 'phone', 'role', 'created_at', 'updated_at')
        .where({phone})
        .first();

        return result;
    };

    updateById = async (id, data) => {
        await db_laundry(TB)
        .where({id})
        .update({
            ...data,
            updated_at: db_laundry.fn.now()
        });

        return this.getUserById(id);
    };

    deleteById = async (id) => {
        const result = await db_laundry(TB)
        .where({id})
        .del();

        return result;
    };

    getPasswordHashById = async (id) => {
        const result = await db_laundry(TB)
        .select('password_hash')
        .where({id})
        .first();

        return result?.password_hash;
    };

    changePassword = async (id, hashedNewPassword) => {
        await db_laundry(TB)
        .where({id})
        .update({
            password_hash: hashedNewPassword,
            updated_at: db_laundry.fn.now()
        });

        return this.getUserById(id);
    };
}

module.exports = new UserModels();