const test = require('ava')
const db = require('../../db')
const path = require('path')
const hydra = require('../../lib/hydra')
const sinon = require('sinon')

const migrationsDirectory = path.join(__dirname, '..', '..', 'db', 'migrations')

let agent
test.before(async () => {
  const conn = await db()
  await conn.migrate.latest({ directory: migrationsDirectory })

  // seed
  await conn('users').insert({ id: 100 })

  // stub hydra introspect
  let introspectStub = sinon.stub(hydra, 'introspect')
  introspectStub.withArgs('validToken').returns({
    active: true,
    sub: '100'
  })
  introspectStub.withArgs('invalidToken').returns({ active: false })

  agent = require('supertest').agent(await require('../../index')())
})

test.after.always(async () => {
  const conn = await db()
  await conn.migrate.rollback({ directory: migrationsDirectory })
  conn.destroy()
})

test('an authenticated user can create a team', async t => {
  let res = await agent.post('/api/teams')
    .send({ name: 'road team 1' })
    .set('Authorization', `Bearer validToken`)
    .expect(200)

  t.is(res.body.name, 'road team 1')
})

test('an unauthenticated user cannot create a team', async t => {
  let res = await agent.post('/api/teams')
    .send({ name: 'road team 2' })

  t.is(res.status, 401)
})
