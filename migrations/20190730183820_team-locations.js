const logger = require('../src/lib/logger')

exports.up = async function (knex) {
  try {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "postgis"')
    await knex.raw('ALTER TABLE team ADD COLUMN location geometry(POINT, 4326)')
  } catch (e) {
    logger.error(e)
  }
}

exports.down = async function (knex) {
  try {
    await knex.raw('ALTER TABLE team DROP COLUMN location')
    await knex.schema.raw('DROP EXTENSION "postgis" CASCADE')
  } catch (e) {
    logger.error(e)
  }
}
