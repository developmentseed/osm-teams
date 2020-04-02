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
  introspectStub.withArgs('user100').returns({
    active: true,
    sub: '100'
  })
  introspectStub.withArgs('user101').returns({
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

test('a user can join a public team', async t => {
  const team = t.context.publicTeam
  let res = await agent.put(`/api/teams/${team.id}/join`)
    .set('Authorization', `Bearer user101`)
  t.is(res.status, 200)
})

test('a user cannot join a private team', async t => {
  const team = t.context.privateTeam
  let res = await agent.put(`/api/teams/${team.id}/join`)
    .set('Authorization', `Bearer user101`)
  t.is(res.status, 401)
})

test('a user cannot join a team they are already in', async t => {
  const team = t.context.publicTeam
  let res = await agent.put(`/api/teams/${team.id}/join`)
    .set('Authorization', `Bearer user100`)
  t.is(res.status, 401)
})

test('a user must be authenticated to join a team', async t => {
  const team = t.context.publicTeam
  let invalidToken = await agent.put(`/api/teams/${team.id}/join`)
    .set('Authorization', `Bearer invalidToken`)
  t.is(invalidToken.status, 401)
  let unauthenticated = await agent.put(`/api/teams/${team.id}/join`)
  t.is(unauthenticated.status, 401)
})
