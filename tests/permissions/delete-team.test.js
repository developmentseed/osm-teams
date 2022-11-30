const test = require('ava')
const db = require('../../src/lib/db')
const { initializeContext } = require('./initialization')

const { migrationsDirectory } = require('../utils')

test.before(initializeContext)

test.after.always(async () => {
  await db.migrate.rollback({ directory: migrationsDirectory })
  db.destroy()
})

test('a team moderator can delete a team', async (t) => {
  let res = await t.context.agent
    .post('/api/teams')
    .send({ name: 'road team 1' })
    .set('Authorization', `Bearer user100`)
    .expect(200)

  let res2 = await t.context.agent
    .delete(`/api/teams/${res.body.id}`)
    .set('Authorization', `Bearer user100`)

  t.is(res2.status, 200)
})

test('a non-team moderator cannot delete a team', async (t) => {
  let res = await t.context.agent
    .post('/api/teams')
    .send({ name: 'road team 2' })
    .set('Authorization', `Bearer user100`)
    .expect(200)

  let res2 = await t.context.agent
    .delete(`/api/teams/${res.body.id}`)
    .set('Authorization', `Bearer user101`)

  t.is(res2.status, 401)
})
