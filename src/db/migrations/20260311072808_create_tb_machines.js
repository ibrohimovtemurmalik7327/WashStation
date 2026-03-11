exports.up = async function (knex) {
  await knex.schema.createTable('tb_machines', (table) => {
    table.bigIncrements('id').primary();

    table
      .bigInteger('branch_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('tb_branches')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.string('name', 100).notNullable();
    table.string('type', 50).notNullable();

    table
      .enu('status', ['idle', 'busy', 'maintenance', 'offline'])
      .notNullable()
      .defaultTo('idle');

    table.boolean('is_active').notNullable().defaultTo(true);

    table.timestamps(true, true);

    table.unique(['branch_id', 'name']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('tb_machines');
};