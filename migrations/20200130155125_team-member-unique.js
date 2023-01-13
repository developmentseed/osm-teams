const logger = require('../src/lib/logger')

/* Add a unique constraint on the member table so the same team_id and
osm_id cannot be added more than once. */

const tableName = 'member'
const columns = ['team_id', 'osm_id']
const keyName = 'member_team_id_osm_id_key'

// in postgresql: `alter table member add unique (team_id, osm_id);`
// creates unique constraint named "member_team_id_osm_id_key"
exports.up = async (knex) => {
  try {
    await knex.schema.alterTable(tableName, (table) =>
      table.unique(columns, keyName)
    )
  } catch (e) {
    logger.error(e)
  }
}

// in posgresql: `alter table member drop constraint member_team_id_osm_id_key;`
// drops the unique constraint.
exports.down = async (knex) => {
  try {
    await knex.schema.alterTable(tableName, (table) =>
      table.dropUnique(columns, keyName)
    )
  } catch (e) {
    logger.error(e)
  }
}
