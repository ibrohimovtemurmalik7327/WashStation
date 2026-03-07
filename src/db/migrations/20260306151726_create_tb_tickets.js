exports.up = async function (knex) {
    await knex.schema.createTable('tb_tickets', (table) => {

        table.bigIncrements('id').primary();

        table
            .enu('type', ['register', 'login', 'reset_password'])
            .notNullable();

        table
            .string('phone', 30)
            .notNullable()
            .index();

        table
            .string('code_hash', 255)
            .notNullable();

        table
            .integer('attempts')
            .unsigned()
            .notNullable()
            .defaultTo(0);   

        table
            .dateTime('expires_at')
            .notNullable();

        table
            .enu('status', ['pending', 'verified', 'expired', 'consumed'])
            .notNullable()
            .defaultTo('pending');

        table.timestamp('created_at').defaultTo(knex.fn.now());

    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('tb_tickets');
};