exports.up = async function (knex) {
  await knex.schema.createTable('user_badge', (table) => {
    table
      .integer('badge_id')
      .references('id')
      .inTable('organization_badge')
      .onDelete('CASCADE')
    table
      .integer('user_id')
      .references('id')
      .inTable('organization_badge')
      .onDelete('CASCADE')
    table.datetime('assigned_at').defaultTo(knex.fn.now())
    table.datetime('valid_until')
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('user_badge')
}
