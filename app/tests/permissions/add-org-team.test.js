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
 * An org owner can create a team
 * We create an org with the user100 user
 * We check that user100 can create a team in the org
 *
 */
test('org owner can create a team', async t => {
  const orgName = 'org owner can create a team'
  const teamName = 'org owner can create a team - team'

  let res = await agent.post('/api/organizations')
    .send({ name: orgName })
    .set('Authorization', `Bearer user100`)
    .expect(200)

  let res2 = await agent.post(`/api/organizations/${res.body.id}/teams`)
    .set('Authorization', `Bearer user100`)
    .send({ name: teamName })

  t.is(res2.status, 200)
})

/**
 * An org manager can create a team
 * We create an org with the user100 user and assign user101
 * as a manager. We check that user101 can create a team in the org
 *
 */
test('org manager can create a team', async t => {
  const orgName = 'org manager can create a team'
  const teamName = 'org manager can create a team - team'

  let res = await agent.post('/api/organizations')
    .send({ name: orgName })
    .set('Authorization', `Bearer user100`)
    .expect(200)

  // We create a manager role for user 101
  await agent.put(`/api/organizations/${res.body.id}/addManager/101`)
    .set('Authorization', `Bearer user100`)
    .expect(200)

  let res2 = await agent.post(`/api/organizations/${res.body.id}/teams`)
    .set('Authorization', `Bearer user101`)
    .send({ name: teamName })

  t.is(res2.status, 200)
})

/**
 * An non-org manager cannot create a team
 * We create an org with the user100 user and assign user101
 * as a manager. We check that user101 can create a team in the org
 *
 */
test('non-org manager cannot create a team', async t => {
  const orgName = 'non-org manager cannot create a team'
  const teamName = 'non-org manager cannot create a team - team'

  let res = await agent.post('/api/organizations')
    .send({ name: orgName })
    .set('Authorization', `Bearer user100`)
    .expect(200)

  let res2 = await agent.post(`/api/organizations/${res.body.id}/teams`)
    .set('Authorization', `Bearer user101`)
    .send({ name: teamName })

  t.is(res2.status, 401)
})
