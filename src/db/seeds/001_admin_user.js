require('dotenv').config();
const bcrypt = require('bcrypt');

exports.seed = async function (knex) {

    const existing = await knex('tb_users')
        .where({ role: 'admin' })
        .first();

    if (existing) return;

    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
        throw new Error('ADMIN_PASSWORD is not defined in .env');
    }

    const password_hash = await bcrypt.hash(password, 10);

    await knex('tb_users').insert({
        username: 'Temurmalik',
        phone: '+998945717327',
        password_hash,
        role: 'admin',
        status: 'active'
    });
};