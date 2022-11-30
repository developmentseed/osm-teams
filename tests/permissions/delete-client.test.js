const test = require('ava')
const db = require('../../src/lib/db')
const hydra = require('../../app/lib/hydra')
const sinon = require('sinon')

const { migrationsDirectory } = require('../utils')

let agent
test.before(async () => {
  await db.migrate.latest({ directory: migrationsDirectory })
  await db.schema.createTable('hydra_client', (t) => {
    // schema at https://github.com/ory/hydra/blob/master/client/manager_sql.go
    t.string('id')
    t.string('owner')
  })

  // seed
  await db('hydra_client').insert({ id: 999, owner: '100' })
  await db('hydra_client').insert({ id: 998, owner: '101' })

  // stub hydra introspect
  let introspectStub = sinon.stub(hydra, 'introspect')
  introspectStub.withArgs('validToken').returns({
    active: true,
    sub: '100',
  })
  introspectStub.withArgs('differentUser').returns({
    active: true,
    sub: '101',
  })
  introspectStub.withArgs('invalidToken').returns({ active: false })

  // stub hydra delete client
  let deleteClientStub = sinon.stub(hydra, 'deleteClient')
  deleteClientStub.returns(Promise.resolve(true))

  agent = require('supertest').agent(await require('../../app/index')())
})

test.after.always(async () => {
  await db.schema.dropTable('hydra_client')
  await db.migrate.rollback({ directory: migrationsDirectory })
  db.destroy()
})

test('a user can delete a client they created', async (t) => {
  let res = await agent
    .delete('/api/clients/999')
    .set('Authorization', 'Bearer validToken')

  t.is(res.status, 200)
})

test("a user can't delete a client they don't own", async (t) => {
  let res = await agent
    .delete('/api/clients/998')
    .set('Authorization', 'Bearer validToken')

  t.is(res.status, 401)
})
