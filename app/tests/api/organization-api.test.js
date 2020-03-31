const path = require('path')
const test = require('ava')
const sinon = require('sinon')

const db = require('../../db')
const team = require('../../lib/team')
const organization = require('../../lib/organization')
const permissions = require('../../manage/permissions')

const migrationsDirectory = path.join(__dirname, '..', '..', 'db', 'migrations')

let agent

test.before(async () => {
  const conn = await db()
  await conn.migrate.latest({ directory: migrationsDirectory })

  // seed
  await conn('users').insert({ id: 1 })
  await conn('users').insert({ id: 2 })
  await conn('users').insert({ id: 3 })
  await conn('users').insert({ id: 4 })

  // Ensure authenticate middleware always goes through with user_id 1
  const middleware = function () {
    return function (req, res, next) {
      res.locals.user_id = 1
      return next()
    }
  }

  sinon.stub(permissions, 'can').callsFake(middleware)
  sinon.stub(permissions, 'authenticate').callsFake(middleware)
  sinon.stub(permissions, 'check').callsFake(middleware)

  agent = require('supertest').agent(await require('../../index')())
})

test.after.always(async () => {
  const conn = await db()
  await conn.migrate.rollback({ directory: migrationsDirectory })
  conn.destroy()
})

/**
 * Test create an organization
 */
test('create an organization', async t => {
  const res = await agent.post('/api/organizations')
    .send({ name: 'create an organization' })
    .expect(200)

  t.is(res.body.name, 'create an organization')
})

/**
 * Test organization requires a name
 */
test('organization requires name', async t => {
  const res = await agent.post('/api/organizations')
    .send({ })
    .expect(400)

  t.is(res.body.message, 'data.name property is required')
})

/**
 * Test get an organization
 */
test('get organization', async t => {
  const res = await agent.post('/api/organizations')
    .send({ name: 'get organization' })
    .expect(200)

  const org = await agent.get(`/api/organizations/${res.body.id}`)

  t.is(org.body.name, 'get organization')
  t.is(org.body.owners.length, 1)
  t.is(org.body.managers.length, 1)
})

/**
 * Test update organization
 */
test('update organization', async t => {
  const res = await agent.post('/api/organizations')
    .send({ name: 'update organization' })
    .expect(200)

  const updated = await agent.put(`/api/organizations/${res.body.id}`)
    .send({ name: 'update organization 2' })
    .expect(200)

  t.is(updated.body.name, 'update organization 2')
})

/**
 * Test destroy organization
 */
test('destroy organization', async t => {
  const res = await agent.post('/api/organizations')
    .send({ name: 'update organization' })
    .expect(200)

  await agent.delete(`/api/organizations/${res.body.id}`)
    .expect(200)

  const org = await organization.get(res.body.id)
  t.falsy(org)
})

/**
 * Add owner
 */
test('add owner', async t => {
  const res = await agent.post('/api/organizations')
    .send({ name: 'add owner' })
    .expect(200)

  await agent.put(`/api/organizations/${res.body.id}/addOwner/2`)
    .expect(200)

  const owners = await organization.getOwners(res.body.id)

  t.is(owners.length, 2)
})

/**
 * Remove owner
 */
test('remove owner', async t => {
  const res = await agent.post('/api/organizations')
    .send({ name: 'remove owner' })
    .expect(200)

  await organization.addOwner(res.body.id, 2)

  await agent.put(`/api/organizations/${res.body.id}/removeOwner/2`)
    .expect(200)

  const owners = await organization.getOwners(res.body.id)

  t.is(owners.length, 1)
})

/**
 * Add manager
 */
test('add manager', async t => {
  const res = await agent.post('/api/organizations')
    .send({ name: 'add manager' })
    .expect(200)

  await agent.put(`/api/organizations/${res.body.id}/addManager/2`)
    .expect(200)

  const owners = await organization.getManagers(res.body.id)

  t.is(owners.length, 2)
})

/**
 * Remove manager
 */
test('remove manager', async t => {
  const res = await agent.post('/api/organizations')
    .send({ name: 'remove manager' })
    .expect(200)

  await organization.addManager(res.body.id, 2)

  await agent.put(`/api/organizations/${res.body.id}/removeManager/2`)
    .expect(200)

  const owners = await organization.getManagers(res.body.id)

  t.is(owners.length, 1)
})

/**
 * Create org team
 */
test('create an on org team', async t => {
  const teamName = 'create org team - team 1'
  const res = await agent.post('/api/organizations')
    .send({ name: 'create org team' })
    .expect(200)

  await agent.post(`/api/organizations/${res.body.id}/teams`)
    .send({ name: teamName })
    .expect(200)

  const orgTeams = await team.list({ organizationId: res.body.id })
  t.is(orgTeams.length, 1)
})

/**
 * Get org teams
 */
test('get org teams', async t => {
  const teamName1 = 'get org team - team 1'
  const teamName2 = 'get org team - team 2'
  const res = await agent.post('/api/organizations')
    .send({ name: 'get org team' })
    .expect(200)

  await organization.createOrgTeam(res.body.id, { name: teamName1 }, 1)
  await organization.createOrgTeam(res.body.id, { name: teamName2 }, 1)

  const orgTeams = await agent.get(`/api/organizations/${res.body.id}/teams`)
  t.is(orgTeams.body.length, 2)
})
