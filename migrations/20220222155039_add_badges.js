exports.up = async function (knex) {
  await knex.schema.createTable('organization_badge', (table) => {
    table.increments('id')
    table
      .integer('organization_id')
      .references('id')
      .inTable('organization')
      .onDelete('CASCADE')
    table.string('name').notNullable()
    table.string('color').notNullable()
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('organization_badge')
}
