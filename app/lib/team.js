
const db = require('../db')

/**
* Get a team
*
* @param {int} id - team id
* @return {promise}
**/
async function get (id) {
  const conn = await db()
  return conn('team').where('id', id)
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
* Get all teams
* @return {promise}
**/
async function list () {
  const conn = await db()
  return conn('team').select()
}

/**
* Find teams by member id
* @return {promise}
**/
async function findByOsmId (osmId) {
  const conn = await db()
  return conn('team').select().whereIn('id', function () {
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
async function create (data) {
  const conn = await db()
  return conn('team').insert(data).returning('*')
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
  return conn('team').where('id', id).update(data).returning('*')
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
* Add an osm user as a team member
* @param {int} teamId - team id
* @param {int} osmId - osm id
* @return {promise}
**/
async function addMember (teamId, osmId) {
  const conn = await db()
  return conn('member').insert({ team_id: teamId, osm_id: osmId }).returning('*')
}

/**
* Add multiple osm users as team members
* @param {int} teamId - team id
* @param {int} osmIds - osm ids
* @return {promise}
**/
async function updateMembers (teamId, osmIdsToAdd, osmIdstoRemove) {
  const conn = await db()
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
* Remove an osm user as a team member
* @param {int} teamId - team id
* @param {int} osmId - osm id
* @return {promise}
**/
async function removeMember (teamId, osmId) {
  const conn = await db()
  return conn('member').where({ team_id: teamId, osm_id: osmId }).del()
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
  findByOsmId
}
