exports.up = async function (knex) {
    await knex.schema.alterTable('tb_tickets', (table) => {
        table.string('password_hash', 255).nullable().after('code_hash');
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable('tb_tickets', (table) => {
        table.dropColumn('password_hash');
    });
};