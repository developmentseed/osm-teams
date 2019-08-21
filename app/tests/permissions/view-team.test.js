const test = require('ava')
const db = require('../../db')
const path = require('path')
const hydra = require('../../lib/hydra')
const sinon = require('sinon')

const team = require('../../lib/team')

const migrationsDirectory = path.join(__dirname, '..', '..', 'db', 'migrations')

let agent
test.before(async (t) => {
  const conn = await db()
  await conn.migrate.latest({ directory: migrationsDirectory })

  // seed
  await conn('users').insert({ id: 100 })
  await conn('users').insert({ id: 101 })

  t.context.publicTeam = await team.create({ name: 'public team' }, 100)
  t.context.privateTeam = await team.create({ name: 'private team', privacy: 'private' }, 100)

  // stub hydra introspect
  let introspectStub = sinon.stub(hydra, 'introspect')
  introspectStub.withArgs('validToken').returns({
    active: true,
    sub: '100'
  })
  introspectStub.withArgs('differentUser').returns({
    active: true,
    sub: '101'
  })
  introspectStub.withArgs('invalidToken').returns({ active: false })

  agent = require('supertest').agent(await require('../../index')())
})

test.after.always(async () => {
  const conn = await db()
  await conn.migrate.rollback({ directory: migrationsDirectory })
  conn.destroy()
})

test('public teams are visible to unauthenticated users', async t => {
  const team = t.context.publicTeam
  let res = await agent.get(`/api/teams/${team.id}`)
  t.is(res.status, 200)
})

test('private teams are not visible to unauthenticated users', async t => {
  const team = t.context.privateTeam
  let res = await agent.get(`/api/teams/${team.id}`)
  t.is(res.status, 401)
})

test('private teams are visible to team moderators', async t => {
  const team = t.context.privateTeam
  let res = await agent.get(`/api/teams/${team.id}`)
    .set('Authorization', `Bearer validToken`)
  t.is(res.status, 200)
})
