
const db = require('../db')

/**
* Get a team
*
* @param {int} id - team id
* @return {promise}
**/
function get (id, conn) {
  conn = conn || db
  return conn('team').where('id', id)
}

/**
* Get a team's members
*
* @param {int} id - team id
* @return {promise}
**/
function getMembers (id, conn) {
  conn = conn || db
  return conn('member').where('team_id', id)
}

/**
* Get all teams
* @return {promise}
**/
function list () {
  return db('team').select()
}

/**
* Find teams by member id
* @return {promise}
**/
function findByOsmId (osmId) {
  return db('team').select().whereIn('id', function () {
    this.select('team_id').from('member').where('osm_id', String(osmId))
  })
}

/**
* Create a team
*
* @param {object} data - params for a team
* @param {string} data.name - name of the team
* @return {promise}
**/
function create (data) {
  return db('team').insert(data).returning('*')
}

/**
* Update a team
* @param {int} id - team id
* @param {object} data - params for a team
* @param {string} data.name - name of the team
* @return {promise}
**/
function update (id, data) {
  return get(id).update(data).returning('*')
}

/**
* Destroy a team and its members
* @param {int} id - team id
* @return {promise}
**/
function destroy (id) {
  return db.transaction(async trx => {
    await get(id, trx).del()
    await getMembers(id, trx).del()
  })
}

/**
* Add an osm user as a team member
* @param {int} teamId - team id
* @param {int} osmId - osm id
* @return {promise}
**/
function addMember (teamId, osmId) {
  return db('member').insert({ team_id: teamId, osm_id: osmId }).returning('*')
}

/**
* Add multiple osm users as team members
* @param {int} teamId - team id
* @param {int} osmIds - osm ids
* @return {promise}
**/
function updateMembers (teamId, osmIdsToAdd, osmIdstoRemove) {
  return db.transaction(async trx => {
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
* Remove an osm user as a team member
* @param {int} teamId - team id
* @param {int} osmId - osm id
* @return {promise}
**/
function removeMember (teamId, osmId) {
  return db('member').where({ team_id: teamId, osm_id: osmId }).del()
}

/**
* Add an osm user as a team moderator
* @param {int} teamId - team id
* @param {int} osmId - osm id
* @return {promise}
**/
function addModerator (teamId, osmId) {
  return db('moderator').insert({ team_id: teamId, osm_id: osmId }).returning('*')
}

/**
* Remove an osm user as a team moderator
* @param {int} teamId - team id
* @param {int} osmId - osm id
* @return {promise}
**/
function removeModerator (teamId, osmId) {
  return db('moderator').where({ team_id: teamId, osm_id: osmId }).del()
}

/**
* Get a team's moderators
*
* @param {int} id - team id
* @return {promise}
**/
function getModerators (id, conn) {
  conn = conn || db
  return conn('moderator').where('team_id', id)
}

/**
* Get a team's moderators
*
* @param {int} teamId - team id
* @param {int} osmId - osm id
* @return {promise}
**/
function isModerator (teamId, osmId) {
  return db('moderator').where({ team_id: teamId, osm_id: osmId })
    .then((result) => !!result.length)
}

module.exports = {
  get,
  list,
  create,
  update,
  destroy,
  getMembers,
  addMember,
  updateMembers,
  removeMember,
  findByOsmId,
  addModerator,
  removeModerator,
  getModerators,
  isModerator
}
