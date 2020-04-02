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

test('a team moderator can update a team', async t => {
  let res = await agent.post('/api/teams')
    .send({ name: 'road team 1' })
    .set('Authorization', `Bearer user100`)
    .expect(200)

  let res2 = await agent.put(`/api/teams/${res.body.id}`)
    .set('Authorization', `Bearer user100`)
    .send({ name: 'building team 1' })

  t.is(res2.status, 200)
})

test('a non-team moderator cannot update a team', async t => {
  let res = await agent.post('/api/teams')
    .send({ name: 'road team 2' })
    .set('Authorization', `Bearer user100`)
    .expect(200)

  let res2 = await agent.put(`/api/teams/${res.body.id}`)
    .set('Authorization', `Bearer user101`)
    .send({ name: 'building team 2' })

  t.is(res2.status, 401)
})

test('an org team can be updated by the the org manager', async t => {
  // Let's create an organization, user100 is the owner
  const res = await agent.post('/api/organizations')
    .send({ name: 'org manager can update team' })
    .set('Authorization', `Bearer user100`)
    .expect(200)

  // Let's set user101 to be a manager of this organization and create a
  // team in the organization
  await agent.put(`/api/organizations/${res.body.id}/addManager/101`)
    .set('Authorization', `Bearer user100`)
    .expect(200)

  const res2 = await agent.post(`/api/organizations/${res.body.id}/teams`)
    .send({ name: 'org team can be updated by manager - team' })
    .set('Authorization', `Bearer user101`)
    .expect(200)

  // Use the manager to update the team
  const res3 = await agent.put(`/api/teams/${res2.body.id}`)
    .send({ name: 'org team can be updated by manager - team2' })
    .set('Authorization', `Bearer user101`)

  t.is(res3.status, 200)
})

test('an org team can be updated by the owner of the org', async t => {
  // Let's create an organization, user100 is the owner
  const res = await agent.post('/api/organizations')
    .send({ name: 'org owner can update team' })
    .set('Authorization', `Bearer user100`)
    .expect(200)

  // Let's set user101 to be a manager of this organization and create a
  // team in the organization
  await agent.put(`/api/organizations/${res.body.id}/addManager/101`)
    .set('Authorization', `Bearer user100`)
    .expect(200)

  const res2 = await agent.post(`/api/organizations/${res.body.id}/teams`)
    .send({ name: 'org team can be updated by owner - team' })
    .set('Authorization', `Bearer user101`)
    .expect(200)

  // user101 is the moderator and manager, but user100 should be able
  // to edit this team
  const res3 = await agent.put(`/api/teams/${res2.body.id}`)
    .send({ name: 'org team can be updated by owner - team2' })
    .set('Authorization', `Bearer user100`)

  t.is(res3.status, 200)
})
