const knex = require('knex')
const connections = require('./knexfile')

const config = connections[process.env.NODE_ENV]
module.exports = knex(config)
