const db = require('../db')

/**
* Get a team
*
* @param {int} id - team id
**/
function get (id) {
  return db('team').where('id', id)
}

/**
* Get all teams
**/
function list () {
  return db('team').select()
}

/**
* Create a team
*
* @param {object} data - params for a team
* @param {string} data.name - name of the team
**/
function create (data) {
  return db('team').insert(data).returning('*')
}

/**
* Update a team
* @param {int} id - team id
* @param {object} data - params for a team
* @param {string} data.name - name of the team
**/
function update (id, data) {
  return get(id).update(data).returning('*')
}

/**
* Destroy a team
* @param {int} id - team id
**/
function destroy (id) {
  return get(id).del()
}

module.exports = {
  get,
  list,
  create,
  update,
  destroy
}
