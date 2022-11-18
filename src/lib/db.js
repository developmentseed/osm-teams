const knex = require('knex')
const connections = require('../../knexfile')

const config = connections[process.env.NODE_ENV]

let cachedKnex
module.exports = async function () {
  if (!cachedKnex) {
    cachedKnex = knex(config)
  }
  return cachedKnex
}
