/**
 * The purpose of this migration file is to create user, team and organization profiles
 */

exports.up = async (knex) => {
  await knex.schema.createTable('profile_keys', table => {
    table.increments('id')
    table.string('name').notNullable()
    table.integer('owner_user').references('id').inTable('users').nullable().onDelete('CASCADE')
    table.integer('owner_team').references('id').inTable('team').nullable().onDelete('CASCADE')
    table.integer('owner_org').references('id').inTable('organization').nullable().onDelete('CASCADE')
    table.enum('profile_type', ['org', 'team', 'user'])
    table.text('description')
    table.boolean('required').defaultTo('false')
    table.enum('visibility', ['public', 'team', 'org']).defaultTo('public')
    table.unique(['name', 'owner_user'])
    table.unique(['name', 'owner_team'])
    table.unique(['name', 'owner_org'])
  })

  await knex.schema.alterTable('users', table => {
    table.timestamps(false, true)
  })

  await knex.schema.alterTable('team', table => {
    table.json('profile')
  })

  await knex.schema.alterTable('organization', table => {
    table.json('profile')
  })
}

exports.down = async (knex) => {
  await knex.schema.alterTable('organization', table => {
    table.dropColumn('profile')
  })
  await knex.schema.alterTable('team', table => {
    table.dropColumn('profile')
  })
  await knex.schema.raw('DROP TABLE if exists profile_keys CASCADE')
}
