const db = require('../lib/db')

/**
 * Get paginated list of teams
 *
 * @param options
 * @param {username} options.username - filter by OSM username
 * @return {Promise[Array]}
 **/
async function list(options = {}) {
  // Apply search
  let query = await db('osm_users')
    .select('id', 'name')
    .whereILike('name', `%${options.username}%`)

  return query
}

module.exports = {
  list,
}
