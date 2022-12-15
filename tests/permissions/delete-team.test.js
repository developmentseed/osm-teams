const test = require('ava')
const createAgent = require('../utils/create-agent')
const { resetDb, disconnectDb } = require('../utils/db-helpers')

let user1Agent
let user2Agent
test.before(async () => {
  await resetDb()
  user1Agent = await createAgent({ id: 1 })
  user2Agent = await createAgent({ id: 2 })
})

test.after.always(disconnectDb)

test('a team moderator can delete a team', async (t) => {
  let res = await user1Agent
    .post('/api/teams')
    .send({ name: 'road team 1' })
    .expect(200)

  let res2 = await user1Agent.delete(`/api/teams/${res.body.id}`)

  t.is(res2.status, 200)
})

test('a non-team moderator cannot delete a team', async (t) => {
  let res = await user1Agent
    .post('/api/teams')
    .send({ name: 'road team 2' })
    .expect(200)

  let res2 = await user2Agent.delete(`/api/teams/${res.body.id}`)

  t.is(res2.status, 401)
})
