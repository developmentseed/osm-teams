
exports.up = async function (knex) {
  return knex.schema.createTable('invitations', table => {
    table.string('id')
    table.integer('team_id').references('id').inTable('team').onDelete('CASCADE')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('expires_at').nullable()
  })
}

exports.down = async function (knex) {
  return knex.schema.dropTable('invitations')
}
