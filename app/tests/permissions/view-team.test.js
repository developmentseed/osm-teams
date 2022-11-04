const test = require('ava')
const db = require('../../db')
const path = require('path')
const { initializeContext } = require('./initialization')

const team = require('../../lib/team')

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

test('public teams are visible to unauthenticated users', async (t) => {
  const team = t.context.publicTeam
  let res = await t.context.agent.get(`/api/teams/${team.id}`)
  t.is(res.status, 200)
})

test('private team metadata are visible to unauthenticated users', async (t) => {
  const team = t.context.privateTeam
  let res = await t.context.agent.get(`/api/teams/${team.id}`)
  t.is(res.status, 200)
})

test('private team metadata are visible to team moderators', async (t) => {
  const team = t.context.privateTeam
  let res = await t.context.agent
    .get(`/api/teams/${team.id}`)
    .set('Authorization', `Bearer user100`)
  t.is(res.status, 200)
})
