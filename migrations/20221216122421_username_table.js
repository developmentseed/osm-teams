exports.up = async function (knex) {
  await knex.schema.createTable('usernames', (table) => {
    table.integer('id').primary()
    table.text('name')
    table.text('image')
    table.datetime('updated_at').defaultTo(knex.fn.now())
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTable('usernames')
}
