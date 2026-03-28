const db = require('../../db/connection');
const config = require('../../config/config');

const TB = config.tables?.TB_USERS || 'tb_users';

const publicColumns = [
    'id',
    'username',
    'phone',
    'role',
    'status',
    'created_at',
    'updated_at'
];

class UserModels {
    createUser = async (data) => {
        const [id] = await db(TB).insert(data);
        return this.getUserById(id);
    };

    getUserById = async (id) => {
        return db(TB)
            .select(publicColumns)
            .where({ id })
            .first();
    };

    getUsers = async () => {
        return db(TB)
            .select(publicColumns)
            .orderBy('id', 'desc');
    };

    getByPhone = async (phone) => {
        return db(TB)
            .select(publicColumns)
            .where({ phone })
            .first();
    };

    getByUsername = async (username) => {
        return db(TB)
            .select(publicColumns)
            .where({ username })
            .first();
    };

    getByPhoneWithPassword = async (phone) => {
        return db(TB)
            .select([...publicColumns, 'password_hash'])
            .where({ phone })
            .first();
    };

    getByIdWithPassword = async (id) => {
        return db(TB)
            .select([...publicColumns, 'password_hash'])
            .where({ id })
            .first();
    };

    updateUser = async (id, data) => {
        await db(TB)
            .where({ id })
            .update({
                ...data,
                updated_at: db.fn.now()
            });

        return this.getUserById(id);
    };

    updatePassword = async (id, password_hash) => {
        await db(TB)
            .where({ id })
            .update({
                password_hash,
                updated_at: db.fn.now()
            });

        return this.getUserById(id);
    };

    deactivateUser = async (id) => {
        await db(TB)
            .where({ id })
            .update({
                status: 'inactive',
                updated_at: db.fn.now()
            });

        return this.getUserById(id);
    };
};

module.exports = new UserModels();