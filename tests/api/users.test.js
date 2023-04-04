const test = require('ava')
const { resetDb, disconnectDb } = require('../utils/db-helpers')
const createAgent = require('../utils/create-agent')

let user1Agent
test.before(async () => {
  await resetDb()
  user1Agent = await createAgent({ id: 1 })
})

test.after.always(disconnectDb)

test('list users', async (t) => {
  let res = await user1Agent.get('/api/users?search=wille').expect(200)

  t.deepEqual(res.body.users, [{ id: 360183, name: 'wille' }])
})

test('list users return empty array if user does not exist', async (t) => {
  let res = await user1Agent
    .get('/api/users?search=3562hshgh23123wille')
    .expect(200)

  t.deepEqual(res.body.users, [])
})
