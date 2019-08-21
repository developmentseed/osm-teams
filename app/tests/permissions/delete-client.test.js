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
  await conn.schema.createTable('hydra_client', t => {
    // schema at https://github.com/ory/hydra/blob/master/client/manager_sql.go
    t.string('id')
    t.string('owner')
  })

  // seed
  await conn('hydra_client').insert({ id: 999, owner: '100' })
  await conn('hydra_client').insert({ id: 998, owner: '101' })

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
  await conn.schema.dropTable('hydra_client')
  await conn.migrate.rollback({ directory: migrationsDirectory })
  conn.destroy()
})

test('a user can delete a client they created', async t => {
  let res = await agent.delete('/api/clients/999')
    .set('Authorization', 'Bearer validToken')

  t.is(res.status, 200)
})

test("a user can't delete a client they don't own", async t => {
  let res = await agent.delete('/api/clients/998')
    .set('Authorization', 'Bearer validToken')

  t.is(res.status, 401)
})
