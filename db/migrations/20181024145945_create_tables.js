exports.up = async (knex) => {
  await knex.schema.createTable('team', (table) => {
    table.increments('id')
    table.string('name').unique()
    table.string('hashtag').unique()
    table.string('bio')
    table.enum('privacy', ['public', 'private', 'unlisted']).defaultTo('public')
    table.boolean('require_join_request').defaultTo(false)
    table.timestamps(false, true)
  })

  await knex.schema.createTable('moderator', (table) => {
    table.increments('id')
    table.integer('team_id')
    table.integer('osm_id')
  })

  await knex.schema.createTable('member', (table) => {
    table.increments('id')
    table.integer('team_id')
    table.integer('osm_id')
  })

  await knex.schema.createTable('join_request', (table) => {
    table.increments('id')
    table.integer('team_id')
    table.integer('osm_id')
  })
}

exports.down = async (knex) => {
  try {
    await knex.schema.dropTable('team')
    await knex.schema.dropTable('moderator')
    await knex.schema.dropTable('member')
    await knex.schema.dropTable('join_request')
  } catch (e) {
    console.error(e)
  }
}
