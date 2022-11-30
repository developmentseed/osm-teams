const test = require('ava')
const createAgent = require('../utils/create-agent')
const { resetDb, disconnectDb } = require('../utils/db-helpers')

let user1Agent
let user2Agent
let user3Agent
let org1
test.before(async () => {
  await resetDb()
  user1Agent = await createAgent({ id: 1 })
  user2Agent = await createAgent({ id: 2 })
  user3Agent = await createAgent({ id: 3 })
  org1 = (
    await user1Agent
      .post('/api/organizations')
      .send({ name: 'permissions org' })
  ).body
})

test.after.always(disconnectDb)

/**
 * An org owner can create a team
 * We create an org with the user1 user
 * We check that user1 can create a team in the org
 *
 */
test('org owner can create a team', async (t) => {
  const teamName = 'org owner can create a team - team'

  const res = await user1Agent
    .post(`/api/organizations/${org1.id}/teams`)
    .send({ name: teamName })

  t.is(res.statusCode, 200)
})

/**
 * An org manager can create a team
 * We create an org with the user1 user and assign user2
 * as a manager. We check that user2 can create a team in the org
 *
 */
test('org manager can create a team', async (t) => {
  const teamName = 'org manager can create a team - team'

  // We create a manager role for user 2
  await user1Agent.put(`/api/organizations/${org1.id}/addManager/2`).expect(200)

  const res = await user2Agent
    .post(`/api/organizations/${org1.id}/teams`)
    .send({ name: teamName })
  t.is(res.statusCode, 200)
})

/**
 * An non-org manager cannot create a team
 * We create an org with the user1 user and check that a non
 *
 */
test('non-org manager cannot create a team', async (t) => {
  const teamName = 'non-org manager cannot create a team - team'

  const res = await user3Agent
    .post(`/api/organizations/${org1.id}/teams`)
    .send({ name: teamName })

  t.is(res.statusCode, 401)
})
