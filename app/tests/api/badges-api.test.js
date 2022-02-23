const path = require('path')
const test = require('ava')
const sinon = require('sinon')

const db = require('../../db')
const hydra = require('../../lib/hydra')

const { dropTables } = require('../utils')

const migrationsDirectory = path.join(
  __dirname,
  '..',
  '..',
  'db',
  'migrations'
)

let app
let dbClient
let orgAdminAgent
let introspectStub = sinon.stub(hydra, 'introspect')

async function createUserAgent ({ id }) {
  await dbClient('users').insert({ id })
  introspectStub.withArgs(`user${id}`).returns({
    active: true,
    sub: `${id}`
  })
  return require('supertest')
    .agent(app)
    .set('Authorization', `Bearer user${id}`)
}

test.before(async () => {
  console.log('Connecting to test database...')
  dbClient = await db()

  console.log('Dropping tables...')
  await dropTables(dbClient)

  console.log('Migrating...')
  await dbClient.migrate.latest({ directory: migrationsDirectory })

  console.log('Starting server...')
  app = await require('../../index')()

  // seed
  console.log('Creating agents...')
  orgAdminAgent = await createUserAgent({ id: 1 })
})

test.after.always(async () => {
  dbClient.destroy()
})

/**
 * Test create an organization
 */
test('Add badge to organization', async (t) => {
  const { body: org1 } = await orgAdminAgent
    .post('/api/organizations')
    .send({ name: 'create an organization' })
    .expect(200)

  const { body: badge1 } = await orgAdminAgent
    .post(`/api/organizations/${org1.id}/badge`)
    .send({ name: 'badge 1', color: 'red' })
    .expect(200)

  t.deepEqual(badge1, {
    id: 1,
    organization_id: org1.id,
    name: 'badge 1',
    color: 'red'
  })
})

// Badge creation
// - Only org admins can create badges
// - Only org admins can edit badges
// - Moderators can assign/edit/remove badges
// - Badges are include in user profile
