exports.up = async (knex) => {
  try {
    await knex.schema.alterTable('team', function (t) {
      t.string('editing_policy')
    })
  } catch (e) {
    console.error(e)
  }
}

exports.down = async (knex) => {
  try {
    await knex.schema.alterTable('team', function (t) {
      t.string('editing_policy')
    })
  } catch (e) {
    console.error(e)
  }
}
