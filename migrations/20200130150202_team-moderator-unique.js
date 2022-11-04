/* Add a unique constraint on the moderator table so the same team_id and
osm_id cannot be added more than once. */

const tableName = 'moderator'
const columns = ['team_id', 'osm_id']
const keyName = 'moderator_team_id_osm_id_key'

// in postgresql: `alter table moderator add unique (team_id, osm_id);`
// creates unique constraint named "moderator_team_id_osm_id_key"
exports.up = async (knex) => {
  try {
    await knex.schema.alterTable(tableName, (table) =>
      table.unique(columns, keyName)
    )
  } catch (e) {
    console.error(e)
  }
}

// in posgresql: `alter table moderator drop constraint moderator_team_id_osm_id_key;`
// drops the unique constraint.
exports.down = async (knex) => {
  try {
    await knex.schema.alterTable(tableName, (table) =>
      table.dropUnique(columns, keyName)
    )
  } catch (e) {
    console.error(e)
  }
}
