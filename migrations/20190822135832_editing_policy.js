const logger = require('../src/lib/logger')

exports.up = async (knex) => {
  try {
    await knex.schema.alterTable('team', function (t) {
      t.string('editing_policy')
    })
  } catch (e) {
    logger.error(e)
  }
}

exports.down = async (knex) => {
  try {
    await knex.schema.alterTable('team', function (t) {
      t.dropColumn('editing_policy')
    })
  } catch (e) {
    logger.error(e)
  }
}
