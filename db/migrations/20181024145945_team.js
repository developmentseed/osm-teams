exports.up = async (knex) => {
  await knex.schema.createTable('team', (table) => {
    table.increments('id')
    table.string('name')
    table.timestamps(false, true)
  })
}

exports.down = async (knex) => {
  try {
    await knex.schema.dropTable('team')
  } catch (e) {
    console.error(e)
  }
}
