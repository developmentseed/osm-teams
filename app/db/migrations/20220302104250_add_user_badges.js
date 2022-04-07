exports.up = async function (knex) {
  await knex.schema.createTable('user_badges', (table) => {
    table
      .integer('badge_id')
      .references('id')
      .inTable('organization_badge')
      .onDelete('CASCADE')
    table.integer('user_id')
    table.datetime('assigned_at').defaultTo(knex.fn.now())
    table.datetime('valid_until')
    table.unique(['badge_id', 'user_id'])
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('user_badges')
}
