exports.up = async (knex) => {
  await knex.schema.createTable('organization', (table) => {
    table.increments('id')
    table.string('name').notNullable().unique()
    table.text('description')
    table.timestamps(false, true)
  })

  await knex.schema.createTable('organization_owner', (table) => {
    table.increments('id')
    table
      .integer('organization_id')
      .references('id')
      .inTable('organization')
      .onDelete('CASCADE')
    table.integer('osm_id')
    table.unique(['organization_id', 'osm_id'])
  })

  await knex.schema.createTable('organization_manager', (table) => {
    table.increments('id')
    table
      .integer('organization_id')
      .references('id')
      .inTable('organization')
      .onDelete('CASCADE')
    table.integer('osm_id')
    table.unique(['organization_id', 'osm_id'])
  })

  await knex.schema.createTable('organization_team', (table) => {
    table.increments('id')
    table
      .integer('team_id')
      .references('id')
      .inTable('team')
      .onDelete('CASCADE')
    table
      .integer('organization_id')
      .references('id')
      .inTable('organization')
      .onDelete('CASCADE')
    table.unique(['organization_id', 'team_id'])
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('organization_team')
  await knex.schema.dropTable('organization_manager')
  await knex.schema.dropTable('organization_owner')
  await knex.schema.dropTable('organization')
}
