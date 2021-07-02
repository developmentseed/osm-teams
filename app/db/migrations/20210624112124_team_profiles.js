/**
 * The purpose of this migration file is to create team and organization profiles
 * These profiles contain metadata for each user part of a team or part of an organization
 */

exports.up = async (knex) => {
  await knex.schema.createTable('profile_keys', table => {
    table.increments('id')
    table.string('name').notNullable()
    table.integer('owner_user').references('id').inTable('users').nullable().onDelete('CASCADE')
    table.integer('owner_team').references('id').inTable('team').nullable().onDelete('CASCADE')
    table.integer('owner_org').references('id').inTable('organization').nullable().onDelete('CASCADE')
    table.text('description')
    table.boolean('required').defaultTo('false')
    table.enum('visibility', ['public', 'team', 'org']).defaultTo('public'),
    table.unique(['name', 'owner_user']),
    table.unique(['name', 'owner_team']),
    table.unique(['name', 'owner_org'])
  })

  await knex.schema.createTable('profile_values', table => {
    table.increments('id')
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.integer('key_id').references('id').inTable('profile_keys').onDelete('CASCADE')
    table.text('value')
    table.timestamps(false, true)
    table.unique(['user_id', 'key_id'])
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('profile_values')
  await knex.schema.dropTable('profile_keys')
}
