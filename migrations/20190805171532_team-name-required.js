const logger = require('../src/lib/logger')

exports.up = async (knex) => {
  try {
    await knex.schema.alterTable('team', function (t) {
      t.string('name').notNullable().alter()
    })
  } catch (e) {
    logger.error(e)
  }
}

exports.down = async (knex) => {
  try {
    await knex.schema.alterTable('team', function (t) {
      t.string('name').nullable().alter()
    })
  } catch (e) {
    logger.error(e)
  }
}
