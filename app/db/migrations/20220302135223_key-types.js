exports.up = async (knex) => {
  return knex.schema.alterTable('profile_keys', (table) => {
    table.text('key_type').defaultTo('text')
  })
}

exports.down = async (knex) => {
  return knex.schema.alterTable('profile_keys', (table) => {
    table.dropColumn('key_type')
  })
}
