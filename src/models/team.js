const db = require('../lib/db')
const logger = require('../lib/logger')
const knexPostgis = require('knex-postgis')
const join = require('url-join')
const xml2js = require('xml2js')
const { unpack } = require('../../app/lib/utils')
const { prop, isEmpty, difference, concat, assoc, includes } = require('ramda')
const request = require('request-promise-native')
const { addZeroPadding } = require('../lib/utils')

const DEFAULT_PAGE_SIZE = process.env.DEFAULT_PAGE_SIZE

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
  // TODO Quick fix, we need to do proper type validation
  const userIds = ids.map((i) => parseInt(i))

  // get the display names from the database table first
  const foundUsers = await db('osm_users').whereIn('id', userIds)
  const foundUserIds = foundUsers.map(prop('id'))
  const notFound = difference(userIds, foundUserIds)

  let usersFromOSM = []
  if (notFound.length > 0) {
    try {
      // The following avoids hitting OSM API when testing. We use TESTING variable
      // instead of NODE_EN because the server run in development mode while
      // executing E2E tests.
      if (process.env.TESTING === 'true') {
        usersFromOSM = notFound.map((id) => ({
          id,
          name: `User ${addZeroPadding(id, 3)}`, // use zero-padded number for consistent table sorting during tests
          image: `https://via.placeholder.com/150`,
        }))
      } else {
        const resp = await request(
          join(
            process.env.OSM_API,
            `/api/0.6/users?users=${notFound.join(',')}`
          )
        )
        var parser = new xml2js.Parser()

        usersFromOSM = await new Promise((resolve, reject) => {
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
                image: img,
              }
            })
            resolve(users)
          })
        })
      }

      let usersToInsert = usersFromOSM.map((u) => {
        return assoc('updated_at', db.fn.now(), u)
      })
      await db('osm_users').insert(usersToInsert)
    } catch (e) {
      logger.error(e)
      throw new Error('Could not resolve user names from OSM')
    }
  }
  return concat(usersFromOSM, foundUsers)
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
 * Gets the associated organization of a team
 * if it exists
 *
 * @param {int} teamId - team id
 * @returns an organization id if it exists,
 * otherwise null
 */
async function getAssociatedOrgId(teamId) {
  const associations = await db('organization_team').where({
    team_id: teamId,
  })

  if (associations.length > 0) {
    return associations[0].organization_id
  } else {
    return null
  }
}

async function getMembersPaginated(teamId, options) {
  const currentPage = options?.page || 1
  const sort = options?.sort || 'name'
  const order = options?.order || 'asc'
  const perPage = options?.perPage || DEFAULT_PAGE_SIZE

  // Base query for team members
  let query = db('member')
    .join('osm_users', 'member.osm_id', 'osm_users.id')
    .select('member.osm_id as id', 'osm_users.name')
    .where('member.team_id', teamId)
    .groupBy('member.osm_id', 'osm_users.name')

  // Apply search
  if (options.search) {
    query = query.whereILike('osm_users.name', `%${options.search}%`)
  }

  // Apply sort if it's one of the sortable keys
  if (includes(sort, ['name', 'id'])) {
    query = query.orderBy(sort, order)
  }

  // Add pagination
  query = query.paginate({
    isLengthAware: true,
    currentPage,
    perPage,
  })

  const membersPage = await query

  let response = membersPage

  if (options.badges) {
    const associatedOrgId = await getAssociatedOrgId(teamId)

    if (!associatedOrgId) return response

    // Query badges assigned to the users in the list
    const userBadges = await db('user_badges')
      .select(
        'user_badges.user_id',
        'user_badges.badge_id',
        'organization_badge.name',
        'organization_badge.color'
      )
      .join(
        'organization_badge',
        'user_badges.badge_id',
        'organization_badge.id'
      )
      .where('organization_badge.organization_id', associatedOrgId)
      .whereIn(
        'user_badges.user_id',
        membersPage.data.map((u) => u.id)
      )
      .whereRaw(
        `user_badges.valid_until IS NULL OR user_badges.valid_until > NOW()`
      )

    response = {
      pagination: membersPage.pagination,
      data: membersPage.data.map((m) => ({
        ...m,
        badges: userBadges.filter((b) => b.user_id === m.id),
      })),
    }
  }

  return response
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
 * Get paginated list of teams
 *
 * @param options
 * @param {int} options.osmId - filter by whether osmId is a member
 * @param {int} options.organizationId - filter by whether team belongs to organization
 * @param {Array[float]} options.bbox - filter for teams whose location is in bbox (xmin, ymin, xmax, ymax)
 * @return {Promise[Array]}
 **/
async function paginatedList(options = {}) {
  const currentPage = options?.page || 1
  const sort = includes(options?.sort, ['id', 'name'])
    ? prop('sort', options)
    : 'name'
  const order = options?.order || 'asc'
  const perPage = options?.perPage || DEFAULT_PAGE_SIZE

  const { bbox, osmId, organizationId, includePrivate } = options
  const st = knexPostgis(db)

  let query = db('team').select(
    ...teamAttributes,
    st.asGeoJSON('location'),
    db('member').count().whereRaw('team.id = member.team_id').as('members')
  )

  // Apply search
  if (options.search) {
    query = query.whereILike('name', `%${options.search}%`)
  }

  if (!includePrivate) {
    query.where('privacy', 'public')
  }

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

  // Apply sort
  query = query.orderBy(sort, order)

  return query.paginate({
    isLengthAware: true,
    currentPage,
    perPage,
  })
}

/**
 * Get all public teams.
 *
 * @param options
 * @param {Array[float]} options.bbox - filter for teams whose location is in bbox (xmin, ymin, xmax, ymax)
 * @return {[Array]} Array of teams
 **/
async function list({ bbox }) {
  // TODO: this method should be merged to the paginatedList() method when possible
  // for consistency, as they both return a list of teams.

  const st = knexPostgis(db)

  let query = db('team')
    .select(...teamAttributes, st.asGeoJSON('location'))
    .where('privacy', 'public')

  if (bbox) {
    query = query.where(
      st.boundingBoxContained('location', st.makeEnvelope(...bbox))
    )
  }

  return query
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

  // Cache username
  await resolveMemberNames([osmId])

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
  // Get OSM username
  await resolveMemberNames([osmId])

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
  paginatedList,
  listMembers,
  listModerators,
  listModeratedBy,
  create,
  update,
  destroy,
  getMembers,
  getMembersPaginated,
  getAssociatedOrgId,
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
