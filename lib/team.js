
const db = require('../db')

/**
* Get a team
*
* @param {int} id - team id
* @return {promise}
**/
function get (id) {
  return db('team').where('id', id)
}

/**
* Get all teams
* @return {promise}
**/
function list () {
  return db('team').select()
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
* Destroy a team
* @param {int} id - team id
* @return {promise}
**/
function destroy (id) {
  return get(id).del()
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
* Remove an osm user as a team member
* @param {int} teamId - team id
* @param {int} osmId - osm id
* @return {promise}
**/
function removeMember (teamId, osmId) {
  return db('member').where({ team_Id: teamId, osm_id: osmId }).del()
}

module.exports = {
  get,
  list,
  create,
  update,
  destroy,
  addMember,
  removeMember
}
