
exports.up = async (knex) => {
  return knex.schema.alterTable('organization', table => {
    table.enum('privacy', ['public', 'private', 'unlisted']).defaultTo('public')
    table.boolean('teams_can_be_public').defaultTo(true)
  })
}

exports.down = async (knex) => {
  return knex.schema.alterTable('organization', table => {
    table.dropColumn('privacy')
    table.dropColumn('teams_can_be_public')
  })
}
