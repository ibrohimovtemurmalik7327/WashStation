exports.up = async function (knex) {
    await knex.schema.createTable('tb_bookings', (table) => {
        table.bigIncrements('id').primary();

        table
            .bigInteger('user_id')
            .unsigned()
            .notNullable();

        table
            .bigInteger('branch_id')
            .unsigned()
            .notNullable();

        table
            .bigInteger('machine_id')
            .unsigned()
            .notNullable();

        table
            .dateTime('start_time')
            .notNullable();

        table
            .dateTime('end_time')
            .notNullable();

        table
            .enu('status', ['pending', 'confirmed', 'cancelled', 'completed'])
            .notNullable()
            .defaultTo('pending');

        table
            .decimal('total_price', 10, 2)
            .notNullable()
            .defaultTo(0);

        table
            .text('notes')
            .nullable();

        table
            .timestamp('created_at')
            .notNullable()
            .defaultTo(knex.fn.now());

        table
            .timestamp('updated_at')
            .notNullable()
            .defaultTo(knex.fn.now());

        table
            .foreign('user_id')
            .references('id')
            .inTable('tb_users')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');

        table
            .foreign('branch_id')
            .references('id')
            .inTable('tb_branches')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');

        table
            .foreign('machine_id')
            .references('id')
            .inTable('tb_machines')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');

        table.index(['user_id']);
        table.index(['branch_id']);
        table.index(['machine_id']);
        table.index(['status']);
        table.index(['start_time']);
        table.index(['end_time']);
        table.index(['machine_id', 'start_time', 'end_time'], 'idx_bookings_machine_time');
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('tb_bookings');
};