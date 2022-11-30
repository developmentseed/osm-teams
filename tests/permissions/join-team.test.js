const test = require('ava')
const db = require('../../src/lib/db')
const { initializeContext } = require('./initialization')

const team = require('../../src/models/team')

const { migrationsDirectory } = require('../utils')

test.before(async (t) => {
  await initializeContext(t)

  t.context.publicTeam = await team.create({ name: 'public team' }, 100)
  t.context.privateTeam = await team.create(
    { name: 'private team', privacy: 'private' },
    100
  )
})

test.after.always(async () => {
  const conn = await db()
  await conn.migrate.rollback({ directory: migrationsDirectory })
  conn.destroy()
})

test('a user can join a public team', async (t) => {
  const team = t.context.publicTeam
  let res = await t.context.agent
    .put(`/api/teams/${team.id}/join`)
    .set('Authorization', 'Bearer user101')
  t.is(res.status, 200)
})

test('a user cannot join a private team', async (t) => {
  const team = t.context.privateTeam
  let res = await t.context.agent
    .put(`/api/teams/${team.id}/join`)
    .set('Authorization', 'Bearer user101')
  t.is(res.status, 401)
})

test('a user cannot join a team they are already in', async (t) => {
  const team = t.context.publicTeam
  let res = await t.context.agent
    .put(`/api/teams/${team.id}/join`)
    .set('Authorization', 'Bearer user100')
  t.is(res.status, 401)
})

test('a user must be authenticated to join a team', async (t) => {
  const team = t.context.publicTeam
  let invalidToken = await t.context.agent
    .put(`/api/teams/${team.id}/join`)
    .set('Authorization', 'Bearer invalidToken')
  t.is(invalidToken.status, 401)
  let unauthenticated = await t.context.agent.put(`/api/teams/${team.id}/join`)
  t.is(unauthenticated.status, 401)
})
