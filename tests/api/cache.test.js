const test = require('ava')
const db = require('../../src/lib/db')
const createAgent = require('../utils/create-agent')
const { resetDb, disconnectDb } = require('../utils/db-helpers')

let user1Agent
test.before(async () => {
  await resetDb()
  user1Agent = await createAgent({ id: 1 })
})

test.after.always(disconnectDb)

test('cache is filled when requesting team members', async (t) => {
  let team1 = await user1Agent
    .post('/api/teams')
    .send({ name: 'cache team 1' })
    .expect(200)

  const team1Id = team1.body.id

  // Make a request to getMembers
  await user1Agent.get(`/api/teams/${team1Id}/members`).expect(200)

  const usernames = await db('osm_users').select()
  t.true(usernames.length > 0)
})
