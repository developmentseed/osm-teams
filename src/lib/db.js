const knex = require('knex')
const config = require('../../knexfile')
const { attachPaginate } = require('knex-paginate')

// Get db instance
const db = knex(config)

// Add pagination helper, if not already available
if (!db.queryBuilder().paginate) {
  attachPaginate()
}

module.exports = db
