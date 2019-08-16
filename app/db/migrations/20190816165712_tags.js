exports.up = async function (knex) {
  try {
    await knex.schema.createTable('tags', db => {
      db.increments('id').primary()
      db.string('tag')
      db.integer('team_id').references('id').inTable('team').onDelete('CASCADE')
    })
  } catch (e) {
    console.error(e)
  }
}

exports.down = async function (knex) {
  try {
    await knex.schema.dropTable('tags')
  } catch (e) {
    console.error(e)
  }
}
