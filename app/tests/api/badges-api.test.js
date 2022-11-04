const test = require('ava')
const sinon = require('sinon')

const db = require('../../db')
const hydra = require('../../lib/hydra')

const { resetDb } = require('../utils')

let app
let dbClient
let org1
let orgTeam1
let orgOwner = {
  id: 1,
}
let orgManager = {
  id: 2,
}
let orgTeamMember = {
  id: 3,
}
let notOrgMember = {
  id: 4,
}
let badge1, badge2, badge3

let introspectStub = sinon.stub(hydra, 'introspect')

async function createUserAgent({ id }) {
  // Add user to db
  await dbClient('users').insert({ id })

  // Mock hydra auth
  introspectStub.withArgs(`user${id}`).returns({
    active: true,
    sub: `${id}`,
  })

  // Return agent with auth token
  return require('supertest')
    .agent(app)
    .set('Authorization', `Bearer user${id}`)
}

test.before(async () => {
  console.log('Connecting to test database...')
  dbClient = await db()

  await resetDb(dbClient)

  console.log('Starting server...')
  app = await require('../../index')()

  // Create user agents
  console.log('Creating agents...')
  orgOwner.agent = await createUserAgent(orgOwner)
  orgManager.agent = await createUserAgent(orgManager)
  orgTeamMember.agent = await createUserAgent(orgTeamMember)
  notOrgMember.agent = await createUserAgent(notOrgMember)

  // Create organization
  org1 = (
    await orgOwner.agent
      .post('/api/organizations')
      .send({ name: 'Organization 1' })
      .expect(200)
  ).body

  // Create a team
  orgTeam1 = (
    await orgOwner.agent
      .post(`/api/organizations/${org1.id}/teams`)
      .send({ name: 'Organization 1 - Team 1' })
      .expect(200)
  ).body

  // Add team member
  await orgOwner.agent
    .put(`/api/teams/add/${orgTeam1.id}/${orgTeamMember.id}`)
    .expect(200)

  // Add manager
  await orgOwner.agent
    .put(`/api/organizations/${org1.id}/addManager/${orgManager.id}`)
    .expect(200)
})

test.after.always(async () => {
  dbClient.destroy()
})

/**
 * CREATE BADGE
 */
test('Create badge', async (t) => {
  // Owners can create badges
  badge1 = (
    await orgOwner.agent
      .post(`/api/organizations/${org1.id}/badges`)
      .send({ name: 'badge 1', color: 'red' })
      .expect(200)
  ).body

  t.deepEqual(badge1, {
    id: 1,
    organization_id: 1,
    name: 'badge 1',
    color: 'red',
  })

  // Manager are not allowed
  await orgManager.agent
    .post(`/api/organizations/${org1.id}/badges`)
    .send({ name: 'badge 1', color: 'red' })
    .expect(401)

  // Org Team Members are not allowed
  await orgTeamMember.agent
    .post(`/api/organizations/${org1.id}/badges`)
    .send({ name: 'badge 1', color: 'red' })
    .expect(401)

  // Non-members are not-allowed
  await notOrgMember.agent
    .post(`/api/organizations/${org1.id}/badges`)
    .send({ name: 'badge 1', color: 'red' })
    .expect(401)
})

/**
 * PATCH BADGE
 */
test('Patch badge', async (t) => {
  // Allow owners
  let patchedBadge = (
    await orgOwner.agent
      .patch(`/api/organizations/${org1.id}/badges/${badge1.id}`)
      .send({ name: 'badge number 1', color: 'blue' })
      .expect(200)
  ).body

  t.deepEqual(patchedBadge, {
    id: 1,
    organization_id: 1,
    name: 'badge number 1',
    color: 'blue',
  })

  // Disallow managers
  await orgManager.agent
    .patch(`/api/organizations/${org1.id}/badges/${badge1.id}`)
    .send({ name: 'badge 1', color: 'red' })
    .expect(401)

  // Disallow org team Members
  await orgTeamMember.agent
    .patch(`/api/organizations/${org1.id}/badges/${badge1.id}`)
    .send({ name: 'badge 1', color: 'red' })
    .expect(401)

  // Disallow non-members
  await notOrgMember.agent
    .patch(`/api/organizations/${org1.id}/badges/${badge1.id}`)
    .send({ name: 'badge 1', color: 'red' })
    .expect(401)
})

/**
 * LIST BADGES
 */
test('List badges', async (t) => {
  // Add more badges
  badge2 = (
    await orgOwner.agent
      .post(`/api/organizations/${org1.id}/badges`)
      .send({ name: 'badge number 2', color: 'green' })
      .expect(200)
  ).body

  // Add more badges
  badge3 = (
    await orgOwner.agent
      .post(`/api/organizations/${org1.id}/badges`)
      .send({ name: 'badge number 3', color: 'yellow' })
      .expect(200)
  ).body

  // Add more badges
  await orgOwner.agent
    .post(`/api/organizations/${org1.id}/badges`)
    .send({ name: 'badge number 4', color: 'pink' })
    .expect(200)

  // Owners can list badges
  const badgesList = (
    await orgOwner.agent.get(`/api/organizations/${org1.id}/badges`).expect(200)
  ).body

  t.deepEqual(badgesList, [
    {
      id: 1,
      organization_id: 1,
      name: 'badge number 1',
      color: 'blue',
    },
    {
      id: 2,
      organization_id: 1,
      name: 'badge number 2',
      color: 'green',
    },
    {
      id: 3,
      organization_id: 1,
      name: 'badge number 3',
      color: 'yellow',
    },
    {
      id: 4,
      organization_id: 1,
      name: 'badge number 4',
      color: 'pink',
    },
  ])
})

/**
 * DELETE BADGE
 */
test('Delete badge', async (t) => {
  // Disallow managers
  await orgManager.agent
    .delete(`/api/organizations/${org1.id}/badges/${badge1.id}`)
    .expect(401)

  // Disallow org team Members
  await orgTeamMember.agent
    .delete(`/api/organizations/${org1.id}/badges/${badge1.id}`)
    .expect(401)

  // Disallow non-members
  await notOrgMember.agent
    .delete(`/api/organizations/${org1.id}/badges/${badge1.id}`)
    .expect(401)

  // Allow owners
  await orgOwner.agent
    .delete(`/api/organizations/${org1.id}/badges/${badge1.id}`)
    .expect(200)

  // Check if badge list has changed
  const badgesList = (
    await orgOwner.agent.get(`/api/organizations/${org1.id}/badges`).expect(200)
  ).body

  t.deepEqual(badgesList, [
    {
      id: 2,
      organization_id: 1,
      name: 'badge number 2',
      color: 'green',
    },
    {
      id: 3,
      organization_id: 1,
      name: 'badge number 3',
      color: 'yellow',
    },
    {
      id: 4,
      organization_id: 1,
      name: 'badge number 4',
      color: 'pink',
    },
  ])
})

/**
 * ASSIGN BADGE
 */
test('Assign badge', async (t) => {
  const assignBadgeRoute = `/api/organizations/${org1.id}/badges/${badge2.id}/assign/${orgTeamMember.id}`

  // Disallow managers
  await orgManager.agent.post(assignBadgeRoute).expect(401)

  // Disallow org team Members
  await orgTeamMember.agent.post(assignBadgeRoute).expect(401)

  // Disallow non-members
  await notOrgMember.agent.post(assignBadgeRoute).expect(401)

  // Allow owners
  const badgeAssignment = (
    await orgOwner.agent
      .post(
        `/api/organizations/${org1.id}/badges/${badge2.id}/assign/${orgTeamMember.id}`
      )
      .send({
        assigned_at: '2020-02-02T00:00:00.000Z',
        valid_until: '2020-05-05T00:00:00.000Z',
      })
      .expect(200)
  ).body

  t.like(badgeAssignment, {
    badge_id: badge2.id,
    user_id: orgTeamMember.id,
    assigned_at: '2020-02-02T00:00:00.000Z',
    valid_until: '2020-05-05T00:00:00.000Z',
  })
  t.falsy(badgeAssignment.assignedAt)
})

/**
 * LIST USER BADGES
 */
test('List user badges', async (t) => {
  // Assign badge 3
  await orgOwner.agent
    .post(
      `/api/organizations/${org1.id}/badges/${badge3.id}/assign/${orgTeamMember.id}`
    )
    .send({
      assigned_at: '2020-07-07T00:00:00.000Z',
      valid_until: '2020-08-08T00:00:00.000Z',
    })
    .expect(200)

  const badges = (
    await orgManager.agent
      .get(`/api/user/${orgTeamMember.id}/badges`)
      .expect(200)
  ).body

  t.like(badges, {
    badges: [
      {
        id: 2,
        organization_id: 1,
        name: 'badge number 2',
        color: 'green',
        assigned_at: '2020-02-02T00:00:00.000Z',
        valid_until: '2020-05-05T00:00:00.000Z',
      },
      {
        id: 3,
        organization_id: 1,
        name: 'badge number 3',
        color: 'yellow',
        assigned_at: '2020-07-07T00:00:00.000Z',
        valid_until: '2020-08-08T00:00:00.000Z',
      },
    ],
  })
})

/**
 * UPDATE BADGE
 */
test('Update badge', async (t) => {
  const updateBadgeRoute = `/api/organizations/${org1.id}/member/${orgTeamMember.id}/badge/${badge2.id}`

  // Disallow managers
  await orgManager.agent.patch(updateBadgeRoute).expect(401)

  // Disallow org team Members
  await orgTeamMember.agent.patch(updateBadgeRoute).expect(401)

  // Disallow non-members
  await notOrgMember.agent.patch(updateBadgeRoute).expect(401)

  // Allow owners
  const badgeAssignment = (
    await orgOwner.agent
      .patch(updateBadgeRoute)
      .send({
        assigned_at: '2020-01-01Z',
        valid_until: '2021-01-01Z',
      })
      .expect(200)
  ).body

  t.like(badgeAssignment, {
    badge_id: badge2.id,
    user_id: orgTeamMember.id,
    assigned_at: '2020-01-01T00:00:00.000Z',
    valid_until: '2021-01-01T00:00:00.000Z',
  })
})

/**
 * REMOVE BADGE
 */
test('Remove badge', async (t) => {
  const removeBadgeRoute = `/api/organizations/${org1.id}/member/${orgTeamMember.id}/badge/${badge2.id}`

  // Disallow managers
  await orgManager.agent.delete(removeBadgeRoute).expect(401)

  // Disallow org team Members
  await orgTeamMember.agent.delete(removeBadgeRoute).expect(401)

  // Disallow non-members
  await notOrgMember.agent.delete(removeBadgeRoute).expect(401)

  // Allow owners
  await orgOwner.agent.delete(removeBadgeRoute).expect(200)

  const badges = (
    await orgManager.agent
      .get(`/api/user/${orgTeamMember.id}/badges`)
      .expect(200)
  ).body

  t.like(badges, {
    badges: [
      {
        id: 3,
        organization_id: 1,
        name: 'badge number 3',
        color: 'yellow',
        assigned_at: '2020-07-07T00:00:00.000Z',
        valid_until: '2020-08-08T00:00:00.000Z',
      },
    ],
  })
})
