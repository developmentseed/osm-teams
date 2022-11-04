const test = require('ava')
const db = require('../../lib/db')
const path = require('path')
const { initializeContext } = require('./initialization')

const { migrationsDirectory } = require('../utils')

test.before(initializeContext)

test.after.always(async () => {
  const conn = await db()
  await conn.migrate.rollback({ directory: migrationsDirectory })
  conn.destroy()
})

test('an authenticated user can create a team', async (t) => {
  let res = await t.context.agent
    .post('/api/teams')
    .send({ name: 'road team 1' })
    .set('Authorization', 'Bearer user100')
    .expect(200)

  t.is(res.body.name, 'road team 1')
})

test('an unauthenticated user cannot create a team', async (t) => {
  let res = await t.context.agent
    .post('/api/teams')
    .send({ name: 'road team 2' })

  t.is(res.status, 401)
})
