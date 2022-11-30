const test = require('ava')
const db = require('../../src/lib/db')
const path = require('path')
const hydra = require('../../app/lib/hydra')
const sinon = require('sinon')

const migrationsDirectory = path.join(__dirname, '..', '..', 'db', 'migrations')

let agent
test.before(async () => {
  await db.migrate.latest({ directory: migrationsDirectory })

  // seed
  await db('users').insert({ id: 100 })

  // stub hydra introspect
  let introspectStub = sinon.stub(hydra, 'introspect')
  introspectStub.withArgs('validToken').returns({
    active: true,
    sub: '100',
  })
  introspectStub.withArgs('invalidToken').returns({ active: false })

  // stub hydra get clients
  let getClientsStub = sinon.stub('hydra', 'getClients')
  getClientsStub.returns([])

  agent = require('supertest').agent(await require('../../app/index')())
})

test.after.always(async () => {
  await db.migrate.rollback({ directory: migrationsDirectory })
  db.destroy()
})

test('an authenticated user can view their clients', async (t) => {
  let res = await agent
    .get('/api/clients')
    .set('Authorization', `Bearer validToken`)

  t.is(res.status, 200)
})

test('an unauthenticated user cannot view their clients', async (t) => {
  let res = await agent.get('/api/clients')

  t.is(res.status, 401)
})
