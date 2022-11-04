const test = require('ava')
const { prop, map, contains } = require('ramda')
const db = require('../../lib/db')
const organization = require('../../app/lib/organization')
const team = require('../../app/lib/team')
const { resetDb } = require('../utils')

test.before(async () => {
  const conn = await db()

  await resetDb(conn)

  // seed
  await conn('users').insert({ id: 1 })
  await conn('users').insert({ id: 2 })
  await conn('users').insert({ id: 3 })
  await conn('users').insert({ id: 4 })
})

/**
 * Test organization creation
 * An organization is created by a user.
 * The user becomes the owner of that organization and a manager of that organization
 */
test('create an organization', async (t) => {
  // setup
  const name = 'create test'
  const user = 1
  const data = await organization.create({ name }, user)

  // tests
  t.is(data.name, name)
  t.true(await organization.isOwner(data.id, user))
  t.true(await organization.isManager(data.id, user))
})

/**
 * Test name requirement for organization creation
 */
test('organization requires name', async (t) => {
  const user = 1
  const error = await t.throwsAsync(organization.create({}, user))
  t.is(error.message, 'data.name property is required')
})

/**
 * Test organization retrieval
 */
test('get an organization', async (t) => {
  // setup
  const name = 'get test'
  const user = 1
  const created = await organization.create({ name }, user)
  const data = await organization.get(created.id)

  // tests
  t.truthy(data)
  t.is(data.name, name)
})

/**
 * Test organization delete
 */
test('destroy an organization', async (t) => {
  // setup
  const name = 'destroy test'
  const user = 1
  const created = await organization.create({ name }, user)
  await organization.destroy(created.id)

  // tests
  const data = await organization.get(created.id)
  t.falsy(data)
  t.false(await organization.isOwner(created.id, user))
})

/**
 * Test organization update
 * An organization can update its name and description
 */
test('update an organization', async (t) => {
  // setup
  const name = 'update test'
  const newName = 'update test - new name'
  const user = 1
  const created = await organization.create({ name }, user)
  const updated = await organization.update(created.id, { name: newName })

  // tests
  t.is(updated.name, newName)

  // Make sure a name can't be nullable
  const error = await t.throwsAsync(
    organization.update(created.id, { name: null })
  )
  t.is(error.message, 'data.name property is required')
})

/**
 * Test adding an owner
 * - After adding an owner the number of owners increases by 1
 */
test('add owners', async (t) => {
  // setup
  const name = 'add owners'
  const user = 1
  const user2 = 2
  const created = await organization.create({ name }, user)
  await organization.addOwner(created.id, user2)

  // tests
  const owners = map(prop('osm_id'), await organization.getOwners(created.id))
  t.is(owners.length, 2)
  t.true(contains(user, owners))
  t.true(contains(user2, owners))

  // adding the same owner ignores duplicate request
  await organization.addOwner(created.id, user2)
  t.is(owners.length, 2)
  t.true(contains(user, owners))
  t.true(contains(user2, owners))
})

/**
 * Test removing owners
 * - After adding and removing an owner the number of owners should remain the same
 * - Removing a user that is not an owner ignores request
 * - Trying to remove the last owner throws an error
 */
test('remove owners', async (t) => {
  // setup
  const name = 'remove owners'
  const user = 1
  const user2 = 2
  const user3 = 3
  const created = await organization.create({ name }, user)
  await organization.addOwner(created.id, user2)
  await organization.removeOwner(created.id, user2)

  // tests
  const owners = map(prop('osm_id'), await organization.getOwners(created.id))
  t.is(owners.length, 1)
  t.true(contains(user, owners))
  t.false(contains(user2, owners))

  // removing a non owner ignores request
  await organization.addOwner(created.id, user2)
  t.false(contains(user3, owners))
  await organization.removeOwner(created.id, user3)
  t.is(owners.length, 1)
  t.true(contains(user, owners))
  t.false(contains(user3, owners))

  // removing all owners throws an error
  await organization.removeOwner(created.id, user2)
  const error2 = await t.throwsAsync(organization.removeOwner(created.id, user))
  t.is(
    error2.message,
    'cannot remove owner because there must be at least one owner'
  )
})

/**
 * Test add a manager
 * There should be 2 managers because a creator of a team is automatically
 * assigned to be a manager
 */
test('add managers', async (t) => {
  // setup
  const name = 'add managers'
  const user = 1
  const user2 = 2
  const created = await organization.create({ name }, user)
  await organization.addManager(created.id, user2)

  // tests
  const managers = map(
    prop('osm_id'),
    await organization.getManagers(created.id)
  )
  t.is(managers.length, 2)
  t.true(contains(user, managers))
  t.true(contains(user2, managers))

  // adding the same manager ignores duplicate request
  await organization.addManager(created.id, user2)
  t.is(managers.length, 2)
  t.true(contains(user, managers))
  t.true(contains(user2, managers))
})

/**
 * Test removing managers
 * - After adding and removing a manager the number of managers should remain the same
 * - Removing a user that is not a manager ignores request
 */
test('remove managers', async (t) => {
  // setup
  const name = 'remove managers'
  const user = 1
  const user2 = 2
  const user3 = 3
  const created = await organization.create({ name }, user)
  await organization.addManager(created.id, user2)
  await organization.removeManager(created.id, user2)

  // tests
  const managers = map(
    prop('osm_id'),
    await organization.getManagers(created.id)
  )
  t.is(managers.length, 1)
  t.true(contains(user, managers))
  t.false(contains(user2, managers))

  // removing a non manager ignores request
  await organization.removeManager(created.id, user3)
  t.is(managers.length, 1)
  t.true(contains(user, managers))
  t.false(contains(user2, managers))
  t.false(contains(user3, managers))
})

/**
 * Test creating a team as part of an organization
 */
test('create an organization team', async (t) => {
  // setup
  const orgName = 'organization team'
  const teamName = 'org team 1'
  const user = 1
  const org = await organization.create({ name: orgName }, user)
  await organization.createOrgTeam(org.id, { name: teamName }, user)

  // tests
  const teams = await team.list({ organizationId: org.id })
  t.is(teams.length, 1)
  t.is(teams[0].name, teamName)
})
