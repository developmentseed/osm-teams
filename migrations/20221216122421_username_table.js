exports.up = async function (knex) {
  await knex.schema.createTable('usernames', (table) => {
    table.integer('id').primary()
    table.text('name')
    table.text('image')
    table.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = async function (knex) {
  await knex.schema.dropTable('usernames')
}
