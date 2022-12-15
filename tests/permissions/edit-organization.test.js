const test = require('ava')
const db = require('../../src/lib/db')
const createAgent = require('../utils/create-agent')
const { resetDb, disconnectDb } = require('../utils/db-helpers')

// Seed data
const user1 = { id: 1 }
const user2 = { id: 2 }

// Helper variables
let user1Agent
let user2Agent
let org1

// Prepare environment
test.before(async () => {
  await resetDb()

  // Create agents
  user1Agent = await createAgent(user1)
  user2Agent = await createAgent(user2)

  // Add seed data to db
  await db('users').insert(user1)
  await db('users').insert(user2)
  org1 = (
    await user1Agent
      .post('/api/organizations')
      .send({ name: 'permissions org' })
  ).body
})

// Disconnect db
test.after.always(disconnectDb)

/**
 * An org owner can update the org
 * We create an org with the user100 and then
 * see if they can edit the organization
 *
 */
test('org owner can update an org', async (t) => {
  const orgName2 = 'org owner can update an org - org 2'
  const res = await user1Agent
    .put(`/api/organizations/${org1.id}`)
    .send({ name: orgName2 })

  t.is(res.status, 200)
})

/**
 * An org manager cannot update the org
 * We now add a manager and see if they can edit the organization
 *
 */
test('org manager cannot update an org', async (t) => {
  const orgName2 = 'org manager cannot update an org - org 2'

  // We create a manager role for user 2
  await user1Agent
    .put(`/api/organizations/${org1.id}/addManager/${user2.id}`)
    .expect(200)

  const res = await user2Agent
    .put(`/api/organizations/${org1.id}`)
    .send({ name: orgName2 })

  t.is(res.status, 401)
})

/**
 * regular user cannot update the org
 * We create an org and see if a user without a role can update it
 *
 */
test('no-role user cannot update an org', async (t) => {
  const orgName2 = 'no-role user cannot update an org - org 2'

  const res = await user2Agent
    .put(`/api/organizations/${org1.id}`)
    .send({ name: orgName2 })

  t.is(res.status, 401)
})
