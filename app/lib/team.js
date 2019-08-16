const db = require('../db')
const knexPostgis = require('knex-postgis')
const { head, objOf } = require('ramda')
const join = require('url-join')
const xml2js = require('xml2js')
const request = require('request-promise-native')

const { serverRuntimeConfig } = require('../../next.config')

async function unpack (promise) {
  return promise.then(head)
}

/**
 * resolveMemberNames
 * Get the member details for osm ids
 *
 * @param {Array[int]} ids - list of osm ids
 * @returns {Array[Object]} users - ids augmented
 * with user information:
 *  - name: displayName
 *  - id: osm id
 *
 */
async function resolveMemberNames (ids) {
  try {
    const resp = await request(join(serverRuntimeConfig.OSM_API, `/api/0.6/users?users=${ids.join(',')}`))
    var parser = new xml2js.Parser()

    return new Promise((resolve, reject) => {
      parser.parseString(resp, (err, xml) => {
        if (err) { reject(err) }

        let users = xml.osm.user.map(user => ({
          id: user['$'].id,
          name: user['$'].display_name
        }))

        resolve(users)
      })
    })
  } catch (e) {
    throw new Error('Could not resolve usernames')
  }
}

/**
* Get a team
*
* @param {int} id - team id
* @return {promise}
**/
async function get (id) {
  const conn = await db()
  const st = knexPostgis(conn)
  return unpack(conn('team').select('*', st.asGeoJSON('location')).where('id', id))
}

/**
* Get a team's members
*
* @param {int} id - team id
* @return {promise}
**/
async function getMembers (id) {
  const conn = await db()
  return conn('member').where('team_id', id)
}

/**
 * Get tags. If an id is supplied, filter by the team
 *
 * @param {int} id - team id
 **/
async function getTags (id) {
  const conn = await db()

  // TODO This changes for public/private
  let query = conn('tags').select('tag')

  if (id) {
    query = query.where('team_id', id)
  }
  return query
}

/**
 * getModerators
 * Get the moderators of a team
 *
 * @param {int} id - team Id
 * @returns {Promise[Array]} list of moderators
 */
async function getModerators (id) {
  const conn = await db()
  return conn('moderator').where('team_id', id)
}

/**
* Get all teams
*
* @param options
* @param {int} options.osmId - filter by whether osmId is a member
* @param {Array[float]} options.bbox - filter for teams whose location is in bbox (xmin, ymin, xmax, ymax)
* @return {Promise[Array]}
**/
async function list (options) {
  options = options || {}
  const { osmId, bbox } = options

  const conn = await db()
  const st = knexPostgis(conn)

  // TODO: this changes for public / private
  let query = conn('team').select('*', st.asGeoJSON('location'))

  if (osmId) {
    query = query.whereIn('id', function () {
      this.select('team_id').from('member').where('osm_id', osmId)
    })
  }

  if (bbox) {
    query = query.where(st.boundingBoxContained('location', st.makeEnvelope(...bbox)))
  }

  return query
}

/**
* Create a team
* Teams have to have moderators, so we give an osm id
* as the second param
*
* @param {object} data - params for a team
* @param {string} data.name - name of the team
* @param {geojson} data.location - lat/lon of team
* @param {int} osmId - id of first moderator
* @return {promise}
**/
async function create (data, osmId) {
  if (!osmId) throw new Error('moderator osm id is required as second argument')
  if (!data.name) throw new Error('data.name property is required')
  const conn = await db()
  const st = knexPostgis(conn)

  // convert location to postgis geom
  if (data.location) {
    data = Object.assign(data, {
      location: st.setSRID(st.geomFromGeoJSON(data.location), 4326)
    })
  }

  return conn.transaction(async trx => {
    const [row] = await trx('team').insert(data).returning(['*', st.asGeoJSON('location')])
    await trx('member').insert({ team_id: row.id, osm_id: osmId })
    await trx('moderator').insert({ team_id: row.id, osm_id: osmId })
    return row
  })
}

/**
* Update a team
* @param {int} id - team id
* @param {object} data - params for a team
* @param {string} data.name - name of the team
* @return {promise}
**/
async function update (id, data) {
  const conn = await db()
  const st = knexPostgis(conn)

  // convert location to postgis geom
  if (data.location) {
    data = Object.assign(data, {
      location: st.setSRID(st.geomFromGeoJSON(data.location), 4326)
    })
  }

  return unpack(conn('team').where('id', id).update(data).returning(['*', st.asGeoJSON('location')]))
}

/**
* Destroy a team and its members
* @param {int} id - team id
* @return {promise}
**/
async function destroy (id) {
  const conn = await db()
  return conn.transaction(async trx => {
    await trx('team').where('id', id).del()
    await trx('member').where('team_id', id).del()
  })
}

/**
 * Update tags for a team
 * @param {int} teamId - team id
 * @param {array[string]} tags - the tags that this team should have
 * @return {promise}
 */
async function updateTags (teamId, tags) {
  const conn = await db()

  // easiest is to delete existing and create new tags
  // in a transaction
  return conn.transaction(async trx => {
    await trx('tags').where('team_id', teamId).del()
    await trx('tags').where('team_id', teamId)
      .insert(tags.map(tag => ({ tag, 'team_id': teamId })))
  })
}

/**
* Add multiple osm users as team members
* @param {int} teamId - team id
* @param {array} osmIdsToAdd - array of integer osm ids to add
* @param {array} osmIdsToRemove - array of integer osm ids to remove
* @return {promise}
**/
async function updateMembers (teamId, osmIdsToAdd, osmIdstoRemove) {
  const conn = await db()

  // Make sure we have integers
  osmIdsToAdd = (osmIdsToAdd || []).map(x => parseInt(x))
  osmIdstoRemove = (osmIdstoRemove || []).map(x => parseInt(x))

  return conn.transaction(async trx => {
    if (osmIdsToAdd) {
      const members = await trx('member').where('team_id', teamId)
      let dedupedOsmIdsToAdd = osmIdsToAdd.filter(osmId => {
        for (let i = 0; i < members.length; i++) {
          if (members[i].osm_id === osmId) {
            return false
          }
        }
        return true
      })
      const toAdd = dedupedOsmIdsToAdd.map(osmId => ({ team_id: teamId, osm_id: osmId }))
      await trx.batchInsert('member', toAdd).returning('*')
    }
    if (osmIdstoRemove) {
      await trx('member').where('team_id', teamId).andWhere('osm_id', 'in', osmIdstoRemove).del()
    }
  })
}

/**
* Add an osm user as a team member
* @param {int} teamId - team id
* @param {int} osmId - osm id
* @return {promise}
**/
async function addMember (teamId, osmId) {
  return updateMembers(teamId, [osmId], [])
}

/**
* Remove an osm user as a team member
* @param {int} teamId - team id
* @param {int} osmId - osm id
* @return {promise}
**/
async function removeMember (teamId, osmId) {
  return updateMembers(teamId, [], [osmId])
}

/**
 * Add a moderator to a team
 * @param {int} teamId - team id
 * @param {int} osmId - osm id
 */
async function assignModerator (teamId, osmId) {
  const conn = await db()
  return unpack(conn('moderator').insert({ team_id: teamId, osm_id: osmId }))
}

/**
 * Remove a moderator from a team
 * @param {int} teamId - team id
 * @param {int} osmId - osm id
 */
async function removeModerator (teamId, osmId) {
  const conn = await db()
  return unpack(conn('moderator').where({ team_id: teamId, osm_id: osmId }).del())
}

/**
 * Checks if an osm user is a moderator for a team
 * @param {int} teamId - team id
 * @param {int} osmId - osm id
 * @returns boolean
 */
async function isModerator (teamId, osmId) {
  const conn = await db()
  const [{ count }] = await conn('moderator').where({ team_id: teamId, osm_id: osmId }).count()
  return count > 0
}

/**
 * Checks if an osm user is a member of a team
 * @param {int} teamId - team id
 * @param {int} osmId - osm id
 * @returns boolean
 */
async function isMember (teamId, osmId) {
  const conn = await db()
  const [{ count }] = await conn('member').where({ team_id: teamId, osm_id: osmId }).count()
  return count > 0
}

/**
 * isPublic
 * Checks if a team privacy is public
 *
 * @param teamId - team id
 * @returns {Boolean} is the team public?
 */
async function isPublic (teamId) {
  const conn = await db()
  const { privacy } = await unpack(conn('team').where({ id: teamId }))
  return (privacy === 'public')
}

module.exports = {
  get,
  list,
  create,
  update,
  destroy,
  getMembers,
  getModerators,
  getTags,
  updateTags,
  addMember,
  updateMembers,
  removeMember,
  assignModerator,
  removeModerator,
  isModerator,
  isMember,
  isPublic,
  resolveMemberNames
}
