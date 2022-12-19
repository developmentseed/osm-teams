const db = require('../lib/db')
const knexPostgis = require('knex-postgis')
const join = require('url-join')
const xml2js = require('xml2js')
const { unpack } = require('../../app/lib/utils')
const { prop, isEmpty } = require('ramda')
const request = require('request-promise-native')

const { serverRuntimeConfig } = require('../../next.config')

const DEFAULT_LIMIT = 10

/**
 * @swagger
 * components:
 *   schemas:
 *     NewTeam:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The team's name.
 *           example: Local Mappers
 *     Team:
 *       allOf:
 *         - type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: The team ID.
 *               example: 10
 *         - $ref: '#/components/schemas/NewTeam'
 *     ArrayOfTeams:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Team'
 *
 */

/**
 * This doesn't include the profile column, which we get separately
 */
const teamAttributes = [
  'id',
  'name',
  'hashtag',
  'bio',
  'privacy',
  'require_join_request',
  'updated_at',
  'created_at',
]

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
async function resolveMemberNames(ids) {
  // The following avoids hitting OSM API when testing. We use TESTING variable
  // instead of NODE_EN because the server run in development mode while
  // executing E2E tests.
  if (process.env.TESTING === 'true') {
    return ids.map((id) => ({
      id,
      name: `User ${addZeroPadding(id, 3)}`, // use zero-padded number for consistent table sorting
      image: `https://via.placeholder.com/150`,
    }))
  }

  try {
    const resp = await request(
      join(serverRuntimeConfig.OSM_API, `/api/0.6/users?users=${ids.join(',')}`)
    )
    var parser = new xml2js.Parser()

    return new Promise((resolve, reject) => {
      parser.parseString(resp, (err, xml) => {
        if (err) {
          reject(err)
        }

        let users = xml.osm.user.map((user) => {
          let img = prop('img', user)
          if (img) {
            img = img[0]['$'].href
          }
          return {
            id: user['$'].id,
            name: user['$'].display_name,
            img,
          }
        })

        resolve(users)
      })
    })
  } catch (e) {
    console.error(e)
    throw new Error('Could not resolve usernames')
  }
}

/**
 * Get a team
 *
 * @param {int} id - team id
 * @return {promise}
 **/
async function get(id) {
  const st = knexPostgis(db)
  return unpack(
    db('team')
      .select(...teamAttributes, st.asGeoJSON('location'))
      .where('id', id)
  )
}

/**
 * Get a team's members
 *
 * @param {int} id - team id
 * @return {promise}
 **/
async function getMembers(id) {
  return db('member').where('team_id', id)
}

/**
 * getModerators
 * Get the moderators of a team
 *
 * @param {int} id - team Id
 * @returns {Promise[Array]} list of moderators
 */
async function getModerators(id) {
  return db('moderator').where('team_id', id)
}

/**
 * Get team count
 *
 * @param options
 * @param {int} options.organizationId - filter by whether team belongs to organization
 * @return {int}
 **/
async function count({ organizationId }) {
  let query = db('team').count('id')

  if (organizationId) {
    query = query.whereIn('id', function () {
      this.select('team_id')
        .from('organization_team')
        .where('organization_id', organizationId)
    })
  }

  const [{ count }] = await query
  return parseInt(count)
}

/**
 * Get all teams
 *
 * @param options
 * @param {int} options.osmId - filter by whether osmId is a member
 * @param {int} options.organizationId - filter by whether team belongs to organization
 * @param {Array[float]} options.bbox - filter for teams whose location is in bbox (xmin, ymin, xmax, ymax)
 * @param {bool} options.disablePagination - Return all fields when true
 * @return {Promise[Array]}
 **/
async function list(options = {}) {
  const { bbox, osmId, organizationId, page, disablePagination } = options
  const st = knexPostgis(db)

  let query = db('team').select(...teamAttributes, st.asGeoJSON('location'))

  if (osmId) {
    query = query.whereIn('id', function () {
      this.select('team_id').from('member').where('osm_id', osmId)
    })
  }

  if (organizationId) {
    query = query.whereIn('id', function () {
      this.select('team_id')
        .from('organization_team')
        .where('organization_id', organizationId)
    })
  }

  if (bbox) {
    query = query.where(
      st.boundingBoxContained('location', st.makeEnvelope(...bbox))
    )
  }

  // Always sort by team name
  query = query.orderBy('name')

  return disablePagination
    ? query
    : query.paginate({
        isLengthAware: true,
        currentPage: page || 1,
        perPage: DEFAULT_LIMIT,
      })
}

/**
 * List the member osm ids for a list of team ids.
 *
 * @param {number[]} teamIds
 * @returns {Promise<*>}
 * @async
 */
async function listMembers(teamIds) {
  return db('member').select('team_id', 'osm_id').whereIn('team_id', teamIds)
}

/**
 * List the moderator osm ids for a list of team ids.
 *
 * @param {number[]} teamIds
 * @returns {Promise<*>}
 * @async
 */
async function listModerators(teamIds) {
  return db('moderator').select('team_id', 'osm_id').whereIn('team_id', teamIds)
}

/**
 * List all the teams which osm id is a moderator of.
 *
 * @param {*} osmId osm user id to filter by
 * @returns {Promise[Array]}
 */
async function listModeratedBy(osmId) {
  const st = knexPostgis(db)
  const query = db('team')
    .select(teamAttributes, st.asGeoJSON('location'))
    .whereIn('id', (subQuery) =>
      subQuery.select('team_id').from('moderator').where('osm_id', osmId)
    )
  return query
}

/**
 * Create a team
 * Teams have to have moderators, so we give an osm id
 * as the second param
 *
 * @param {object} data - params for a team
 * @param {string} data.name - name of the team
 * @param {geojson?} data.location - lat/lon of team
 * @param {int} osmId - id of first moderator
 * @param {object=} trx - optional parameter for database connection to re-use connection in case of nested
 *   transactions. This is used when a team is created as part of an organization
 * @return {promise}
 **/
async function create(data, osmId, trx) {
  if (!osmId) throw new Error('moderator osm id is required as second argument')
  if (!data.name) throw new Error('data.name property is required')
  const conn = trx || db
  const st = knexPostgis(conn)

  // convert location to postgis geom
  if (data.location) {
    data = Object.assign(data, {
      location: st.setSRID(st.geomFromGeoJSON(data.location), 4326),
    })
  }
  return conn.transaction(async (trx) => {
    const [row] = await trx('team')
      .insert(data)
      .returning(['*', st.asGeoJSON('location')])
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
async function update(id, data) {
  const st = knexPostgis(db)

  // convert location to postgis geom
  if (data.location) {
    data = Object.assign(data, {
      location: st.setSRID(st.geomFromGeoJSON(data.location), 4326),
    })
  }

  return unpack(
    db('team')
      .where('id', id)
      .update(data)
      .returning([...teamAttributes, st.asGeoJSON('location')])
  )
}

/**
 * Destroy a team and its members
 * @param {int} id - team id
 * @return {promise}
 **/
async function destroy(id) {
  return db.transaction(async (trx) => {
    await trx('team').where('id', id).del()
    await trx('member').where('team_id', id).del()
  })
}

/**
 * Add multiple osm users as team members
 * @param {int} teamId - team id
 * @param {array} osmIdsToAdd - array of integer osm ids to add
 * @param {array} osmIdsToRemove - array of integer osm ids to remove
 * @return {promise}
 **/
async function updateMembers(teamId, osmIdsToAdd, osmIdstoRemove) {
  // Make sure we have integers
  osmIdsToAdd = (osmIdsToAdd || []).map((x) => parseInt(x))
  osmIdstoRemove = (osmIdstoRemove || []).map((x) => parseInt(x))

  return db.transaction(async (trx) => {
    if (osmIdsToAdd) {
      const members = await trx('member').where('team_id', teamId)
      let dedupedOsmIdsToAdd = osmIdsToAdd.filter((osmId) => {
        for (let i = 0; i < members.length; i++) {
          if (members[i].osm_id === osmId) {
            return false
          }
        }
        return true
      })
      const toAdd = dedupedOsmIdsToAdd.map((osmId) => ({
        team_id: teamId,
        osm_id: osmId,
      }))
      await trx.batchInsert('member', toAdd).returning('*')
    }
    if (osmIdstoRemove) {
      await trx('member')
        .where('team_id', teamId)
        .andWhere('osm_id', 'in', osmIdstoRemove)
        .del()
    }
  })
}

/**
 * Add an osm user as a team member
 * @param {int} teamId - team id
 * @param {int} osmId - osm id
 * @return {promise}
 **/
async function addMember(teamId, osmId) {
  return updateMembers(teamId, [osmId], [])
}

/**
 * Remove an osm user as a team member. Removes moderator as side-effect when necessary.
 * @param {int} teamId - team id
 * @param {int} osmId - osm id
 * @return {promise}
 **/
async function removeMember(teamId, osmId) {
  const isMod = await isModerator(teamId, osmId)
  if (isMod) {
    await removeModerator(teamId, osmId)
  }
  return updateMembers(teamId, [], [osmId])
}

/**
 * Add a moderator to a team
 * @param {int} teamId - team id
 * @param {int} osmId - osm id
 */
async function assignModerator(teamId, osmId) {
  if (!(await isMember(teamId, osmId))) {
    throw new Error(
      'cannot assign osmId to be moderator because they are not a team member yet'
    )
  }
  return unpack(db('moderator').insert({ team_id: teamId, osm_id: osmId }))
}

/**
 * Remove a moderator from a team.
 * @param {int} teamId - team id
 * @param {int} osmId - osm id
 * @throws {Error} if the osmId is the only remaining moderator for this team, or if osmId was not a moderator.
 */
async function removeModerator(teamId, osmId) {
  const table = 'moderator'
  const moderatorRecord = db(table).where({ team_id: teamId, osm_id: osmId })
  const isModerator = (await moderatorRecord).length > 0
  /* the isModerator() function could have been used here ^, but since we are
   * going to del() the record at the end of this function, calling isModerator()
   * would add a db query. */
  if (!isModerator) {
    throw new Error('cannot remove osmId because osmId is not a moderator')
  }
  const modCount = (await db(table).where({ team_id: teamId })).length
  if (modCount === 1) {
    throw new Error(
      'cannot remove osmId because there must be at least one moderator'
    )
  }
  await moderatorRecord.del()
}

/**
 * Checks if an osm user is a moderator for a team
 * @param {int} teamId - team id
 * @param {int} osmId - osm id
 * @returns boolean
 */
async function isModerator(teamId, osmId) {
  if (!teamId) throw new Error('team id is required as first argument')
  if (!osmId) throw new Error('osm id is required as second argument')
  const result = await db('moderator').where({
    team_id: teamId,
    osm_id: osmId,
  })
  return result.length > 0
}

/**
 * Checks if an osm user is a member of a team
 * @param {int} teamId - team id
 * @param {int} osmId - osm id
 * @returns boolean
 */
async function isMember(teamId, osmId) {
  if (!teamId) throw new Error('team id is required as first argument')
  if (!osmId) throw new Error('osm id is required as second argument')
  const result = await db('member').where({ team_id: teamId, osm_id: osmId })
  return result.length > 0
}

/**
 * isPublic
 * Checks if a team privacy is public
 *
 * @param teamId - team id
 * @returns {Boolean} is the team public?
 */
async function isPublic(teamId) {
  if (!teamId) throw new Error('team id is required as first argument')
  const { privacy } = await unpack(
    db('team')
      .select(
        'id',
        db.raw(`
    case
    when (
      select teams_can_be_public from organization join organization_team on organization.id = organization_id where team_id = team.id
    ) = false then 'private'
    when privacy = 'private' then 'private'
    when privacy = 'public' then 'public'
    end privacy
    `)
      )
      .where({ id: teamId })
  )
  return privacy === 'public'
}

/**
 * associatedOrg
 *
 * If the team is part of an org, return its associated org
 * @param teamId - team id
 * @returns {Object} organization id and name
 */
async function associatedOrg(teamId) {
  if (!teamId) throw new Error('team id is required as first argument')

  return unpack(
    db('organization_team')
      .where('team_id', teamId)
      .join('organization', 'organization_id', 'organization.id')
      .select('organization_id', 'name')
  )
}

async function isInvitationValid(teamId, invitationId) {
  if (!teamId) throw new Error('team id is required as first argument')
  if (!invitationId)
    throw new Error('invitation id is required as second argument')

  const invitations = await db('invitations').where({
    team_id: teamId,
    id: invitationId,
  })

  return !isEmpty(invitations)
}

module.exports = {
  get,
  count,
  list,
  listMembers,
  listModerators,
  listModeratedBy,
  create,
  update,
  destroy,
  getMembers,
  getModerators,
  addMember,
  updateMembers,
  removeMember,
  assignModerator,
  removeModerator,
  isModerator,
  isMember,
  isPublic,
  isInvitationValid,
  resolveMemberNames,
  associatedOrg,
}
