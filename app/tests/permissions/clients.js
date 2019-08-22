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

  // stub hydra get clients
  let getClientsStub = sinon.stub('hydra', 'getClients')
  getClientsStub.returns([])

  agent = require('supertest').agent(await require('../../index')())
})

test.after.always(async () => {
  const conn = await db()
  await conn.migrate.rollback({ directory: migrationsDirectory })
  conn.destroy()
})

test('an authenticated user can view their clients', async t => {
  let res = await agent.get('/api/clients')
    .set('Authorization', `Bearer validToken`)

  t.is(res.status, 200)
})

test('an unauthenticated user cannot view their clients', async t => {
  let res = await agent.get('/api/clients')

  t.is(res.status, 401)
})
