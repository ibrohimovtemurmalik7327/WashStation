exports.up = async function (knex) {
    await knex.schema.alterTable('tb_tickets', (table) => {
        table
            .integer('max_attempts')
            .unsigned()
            .notNullable()
            .defaultTo(5);
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable('tb_tickets', (table) => {
        table.dropColumn('max_attempts');
    });
};