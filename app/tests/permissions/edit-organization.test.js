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
  await conn('users').insert({ id: 101 })
  await conn('users').insert({ id: 102 })

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

/**
 * An org owner can update the org
 * We create an org with the user100 and then
 * see if they can edit the organization
 *
 */
test('org owner can update an org', async t => {
  const orgName = 'org owner can update an org'
  const orgName2 = 'org owner can update an org - org 2'
  const res = await agent.post('/api/organizations')
    .send({ name: orgName })
    .set('Authorization', `Bearer user100`)
    .expect(200)

  const res2 = await agent.put(`/api/organizations/${res.body.id}`)
    .set('Authorization', `Bearer user100`)
    .send({ name: orgName2 })

  t.is(res2.status, 200)
})

/**
 * An org manager cannot update the org
 * We now add a manager and see if they can edit the organization
 *
 */
test('org manager cannot update an org', async t => {
  const orgName = 'org manager cannot update an org'
  const orgName2 = 'org manager cannot update an org - org 2'
  const res = await agent.post('/api/organizations')
    .send({ name: orgName })
    .set('Authorization', `Bearer user100`)
    .expect(200)

  // We create a manager role for user 101
  await agent.post(`/api/organizations/${res.body.id}/addManager/101`)
    .set('Authorization', `Bearer user100`)
    .expect(200)

  const res3 = await agent.put(`/api/organizations/${res.body.id}`)
    .set('Authorization', `Bearer user101`)
    .send({ name: orgName2 })

  t.is(res3.status, 401)
})

/**
 * regular user cannot update the org
 * We create an org and see if a user without a role can update it
 *
 */
test('no-role user cannot update an org', async t => {
  const orgName = 'no-role user cannot update an org'
  const orgName2 = 'no-role user cannot update an org - org 2'
  const res = await agent.post('/api/organizations')
    .send({ name: orgName })
    .set('Authorization', `Bearer user100`)
    .expect(200)

  const res2 = await agent.put(`/api/organizations/${res.body.id}`)
    .set('Authorization', `Bearer user101`)
    .send({ name: orgName2 })

  t.is(res2.status, 401)
})
