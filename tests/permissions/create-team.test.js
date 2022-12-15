const test = require('ava')
const createAgent = require('../utils/create-agent')
const { resetDb, disconnectDb } = require('../utils/db-helpers')

test.before(resetDb)

test.after.always(disconnectDb)

test('an authenticated user can create a team', async (t) => {
  const agent = await createAgent({ id: 1 })
  let res = await agent
    .post('/api/teams')
    .send({ name: 'road team 1' })
    .expect(200)

  t.is(res.body.name, 'road team 1')
})

test('an unauthenticated user cannot create a team', async (t) => {
  const agent = await createAgent()
  let res = await agent.post('/api/teams').send({ name: 'road team 2' })

  t.is(res.status, 401)
})
