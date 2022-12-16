const test = require('ava')

const team = require('../../src/models/team')
const organization = require('../../src/models/organization')

const createAgent = require('../utils/create-agent')
const { resetDb, disconnectDb } = require('../utils/db-helpers')

let user1Agent
test.before(async () => {
  await resetDb()
  user1Agent = await createAgent({ id: 1 })
})

test.after.always(disconnectDb)

/**
 * Test create an organization
 */
test('create an organization', async (t) => {
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'create an organization' })
    .expect(200)

  t.is(res.body.name, 'create an organization')
})

/**
 * Test organization requires a name
 */
test('organization requires name', async (t) => {
  const res = await user1Agent.post('/api/organizations').send({}).expect(400)

  t.is(res.body.message, 'data.name property is required')
})

/**
 * Test get an organization
 */
test('get organization', async (t) => {
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'get organization' })
    .expect(200)

  const org = await user1Agent.get(`/api/organizations/${res.body.id}`)

  t.is(org.body.name, 'get organization')
})

/**
 * Test get an organization's staff
 */
test('get organization staff', async (t) => {
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'get organization staff' })
    .expect(200)

  const org = await user1Agent.get(`/api/organizations/${res.body.id}/staff`)

  t.is(org.body.owners.length, 1)
  t.is(org.body.managers.length, 1)
})

/**
 * Test update organization
 */
test('update organization', async (t) => {
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'update organization' })
    .expect(200)

  const updated = await user1Agent
    .put(`/api/organizations/${res.body.id}`)
    .send({ name: 'update organization 2' })
    .expect(200)

  t.is(updated.body.name, 'update organization 2')
})

/**
 * Test destroy organization
 */
test('destroy organization', async (t) => {
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'update organization' })
    .expect(200)

  await user1Agent.delete(`/api/organizations/${res.body.id}`).expect(200)

  const org = await organization.get(res.body.id)
  t.falsy(org)
})

/**
 * Add owner
 */
test('add owner', async (t) => {
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'add owner' })
    .expect(200)

  await user1Agent
    .put(`/api/organizations/${res.body.id}/addOwner/2`)
    .expect(200)

  const owners = await organization.getOwners(res.body.id)

  t.is(owners.length, 2)
})

/**
 * Remove owner
 */
test('remove owner', async (t) => {
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'remove owner' })
    .expect(200)

  await organization.addOwner(res.body.id, 2)

  await user1Agent
    .put(`/api/organizations/${res.body.id}/removeOwner/2`)
    .expect(200)

  const owners = await organization.getOwners(res.body.id)

  t.is(owners.length, 1)
})

/**
 * Add manager
 */
test('add manager', async (t) => {
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'add manager' })
    .expect(200)

  await user1Agent
    .put(`/api/organizations/${res.body.id}/addManager/2`)
    .expect(200)

  const owners = await organization.getManagers(res.body.id)

  t.is(owners.length, 2)
})

/**
 * Remove manager
 */
test('remove manager', async (t) => {
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'remove manager' })
    .expect(200)

  await organization.addManager(res.body.id, 2)

  await user1Agent
    .put(`/api/organizations/${res.body.id}/removeManager/2`)
    .expect(200)

  const owners = await organization.getManagers(res.body.id)

  t.is(owners.length, 1)
})

/**
 * Create org team
 */
test('create an org team', async (t) => {
  await resetDb()

  const teamName = 'create org team - team 1'
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'create org team' })
    .expect(200)

  await user1Agent
    .post(`/api/organizations/${res.body.id}/teams`)
    .send({ name: teamName })
    .expect(200)

  const { data } = await team.list({ organizationId: res.body.id })
  t.is(data.length, 1)
})

/**
 * Get org teams
 */
test('get org teams', async (t) => {
  await resetDb()

  const teamName1 = 'get org team - team 1'
  const teamName2 = 'get org team - team 2'
  const res = await user1Agent
    .post('/api/organizations')
    .send({ name: 'get org team' })
    .expect(200)

  await organization.createOrgTeam(res.body.id, { name: teamName1 }, 1)
  await organization.createOrgTeam(res.body.id, { name: teamName2 }, 1)

  const {
    body: {
      pagination: { total },
      data,
    },
  } = await user1Agent.get(`/api/organizations/${res.body.id}/teams`)

  t.is(total, 2)
  data.forEach((item) => {
    t.truthy(item.name)
    t.truthy(item.id)
  })
})
