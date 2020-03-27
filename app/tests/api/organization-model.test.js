const path = require('path')
const test = require('ava')
const db = require('../../db')
const organization = require('../../lib/organization')

const migrationsDirectory = path.join(__dirname, '..', '..', 'db', 'migrations')

test.before(async () => {
  const conn = await db()
  await conn.migrate.latest({ directory: migrationsDirectory })

  // seed
  await conn('users').insert({ id: 1 })
  await conn('users').insert({ id: 2 })
  await conn('users').insert({ id: 3 })
  await conn('users').insert({ id: 4 })
})

test.after.always(async () => {
  const conn = await db()
  await conn.migrate.rollback({ directory: migrationsDirectory })
  conn.destroy()
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
  t.truthy(data.name, name)
  t.true(await organization.isOwner(data.id, user))
  t.true(await organization.isManager(data.id, user))
})

/**
 * Test name requirement for organization creation
 */
test('organization requires name', async t => {
  const user = 1
  const error = await t.throwsAsync(organization.create({}, user))
  t.is(error.message, 'data.name property is required')
})

/**
 * Test organization retrieval
 */
test('get an organization', async t => {
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
test('destroy an organization', async t => {
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
test('update an organization', async t => {
  // setup
  const name = 'update test'
  const newName = 'update test - new name'
  const user = 1
  const created = await organization.create({ name }, user)
  const updated = await organization.update(created.id, { name: newName },)
  
  // tests
  t.is(updated.name, newName)

  // Make sure a name can't be nullable
  const error = await t.throwsAsync(organization.update(created.id, { name: null }))
  t.is(error.message, 'data.name property is required')
})



