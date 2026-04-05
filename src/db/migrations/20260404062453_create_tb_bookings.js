exports.up = async function (knex) {
    await knex.schema.createTable('tb_bookings', (table) => {
        table.bigIncrements('id').primary();

        table.bigInteger('user_id').unsigned().notNullable()
            .references('id')
            .inTable('tb_users')
            .onDelete('CASCADE');

        table.bigInteger('branch_id').unsigned().notNullable()
            .references('id')
            .inTable('tb_branches')
            .onDelete('CASCADE');

        table.integer('wash_mass_kg').unsigned().notNullable();

        table.dateTime('requested_start_time').notNullable();
        table.dateTime('wash_end_time').notNullable();
        table.dateTime('buffer_end_time').notNullable();

        table.integer('total_capacity_kg').unsigned().notNullable();

        table.enu('status', ['pending', 'confirmed', 'cancelled', 'completed'])
            .notNullable()
            .defaultTo('confirmed');

        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

        table.index(['branch_id', 'requested_start_time']);
        table.index(['user_id']);
        table.index(['status']);
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('tb_bookings');
};