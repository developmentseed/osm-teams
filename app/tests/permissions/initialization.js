const db = require('../../db')
const sinon = require('sinon')
const hydra = require('../../lib/hydra')
const path = require('path')
const migrationsDirectory = path.join(__dirname, '..', '..', 'db', 'migrations')

/**
 * Helper function to create an org
 * Sets the org body in the context
 *
 * @param {object} t - ava test context
 */
async function createOrg (t) {
  const res = await t.context.agent.post('/api/organizations')
    .send({ name: 'permissions org' })
    .set('Authorization', `Bearer user100`)

  t.context.org = res.body
}

/**
 * Helper function to destroy an org from the context
 * @param {object} t - ava test context
 */
async function destroyOrg (t) {
  return t.context.agent.delete(`/api/organizations/${t.context.org.id}`)
    .send({ name: 'permissions org' })
    .set('Authorization', `Bearer user100`)
}

/**
 * Function to initialize test contexts for permissions
 * @param {Object} t - ava test context
 */
async function initializeContext (t) {
  const conn = await db()
  await conn.migrate.latest({ directory: migrationsDirectory })

  // seed
  await conn('users').insert({ id: 100 })
  await conn('users').insert({ id: 101 })

  // stub hydra introspect
  let introspectStub = sinon.stub(hydra, 'introspect')
  introspectStub.withArgs('user100').returns({
    active: true,
    sub: '100'
  })

  introspectStub.withArgs('user101').returns({
    active: true,
    sub: '101'
  })

  introspectStub.withArgs('user102').returns({
    active: true,
    sub: '102'
  })

  introspectStub.withArgs('invalidToken').returns({ active: false })

  // Initialize context objects
  t.context.agent = require('supertest').agent(await require('../../index')())
}

module.exports = {
  initializeContext,
  createOrg,
  destroyOrg
}
