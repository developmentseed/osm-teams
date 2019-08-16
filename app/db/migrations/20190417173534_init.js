exports.up = async (knex) => {
  await knex.schema.createTable('users', db => {
    db.integer('id').primary()
    db.json('profile')
    db.json('manageToken')
    db.text('osmToken')
    db.text('osmTokenSecret')
  })

  await knex.schema.createTable('team', (table) => {
    table.increments('id').primary()
    table.string('name').unique()
    table.string('hashtag').unique()
    table.string('bio')
    table.enum('privacy', ['public', 'private', 'unlisted']).defaultTo('public')
    table.boolean('require_join_request').defaultTo(false)
    table.timestamps(false, true)
  })

  await knex.schema.createTable('moderator', (table) => {
    table.increments('id').primary()
    table.integer('team_id').references('id').inTable('team').onDelete('CASCADE')
    table.integer('osm_id')
  })

  await knex.schema.createTable('member', (table) => {
    table.increments('id').primary()
    table.integer('team_id').references('id').inTable('team').onDelete('CASCADE')
    table.integer('osm_id')
  })

  await knex.schema.createTable('join_request', (table) => {
    table.increments('id').primary()
    table.integer('team_id').references('id').inTable('team').onDelete('CASCADE')
    table.integer('osm_id')
  })
}

exports.down = async (knex) => {
  try {
    await knex.schema.dropTable('moderator')
    await knex.schema.dropTable('member')
    await knex.schema.dropTable('join_request')
    await knex.schema.dropTable('team')
    await knex.schema.dropTable('users')
  } catch (e) {
    console.error(e)
  }
}
