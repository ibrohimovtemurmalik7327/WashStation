exports.up = async function (knex) {
    await knex.schema.createTable('tb_booking_machines', (table) => {
        table.bigIncrements('id').primary();

        table.bigInteger('booking_id').unsigned().notNullable()
            .references('id')
            .inTable('tb_bookings')
            .onDelete('CASCADE');

        table.bigInteger('machine_id').unsigned().notNullable()
            .references('id')
            .inTable('tb_machines')
            .onDelete('CASCADE');

        table.integer('machine_capacity_kg').unsigned().notNullable();

        table.dateTime('slot_start_time').notNullable();
        table.dateTime('wash_end_time').notNullable();
        table.dateTime('slot_end_time').notNullable();

        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

        table.index(['machine_id', 'slot_start_time']);
        table.index(['booking_id']);
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('tb_booking_machines');
};