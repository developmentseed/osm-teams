
const path = require('path')
const { map, contains, prop } = require('ramda')
const test = require('ava')
const db = require('../../db')
const organization = require('../../lib/organization')
const team = require('../../lib/team')
const profile = require('../../lib/profile')
const { ValidationError, PropertyRequiredError } = require('../../lib/utils')

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

test('add attributes for a public user profile', async (t) => {
  const name = 'Age'
  const visibility = 'public'
  const [data] = await profile.addProfileKey({
    name,
    ownerId: 1,
    ownerType: 'user',
    visibility
  })

  t.truthy(data)
  t.is(data.name, name)
  t.is(data.visibility, visibility)
  t.is(data.required, false)
  t.is(data.owner_user, 1)
})

test('attribute requires name', async (t) => {
  await t.throwsAsync(
    profile.addProfileKey({ ownerId: 1, ownerType: 'user' }),
    { instanceOf: PropertyRequiredError })
})

test('attribute requires ownerType', async (t) => {
  await t.throwsAsync(
    profile.addProfileKey({ name: 'Age', ownerId: 1 }),
    { instanceOf: PropertyRequiredError })
})

test('attribute requires ownerId', async (t) => {
  await t.throwsAsync(
    profile.addProfileKey({ name: 'Age', ownerType: 'user' }),
    { instanceOf: PropertyRequiredError })
})

test('ownerType must be valid', async (t) => {
  await t.throwsAsync(
    profile.addProfileKey({ name: 'Age', ownerId: 1, ownerType: 'notValid' }),
    { instanceOf: ValidationError })
})

test('visibility must be valid', async (t) => {
  await t.throwsAsync(
    profile.addProfileKey({ name: 'Age', ownerId: 1, ownerType: 'user', visibility: 'notValid' }),
    { instanceOf: ValidationError })
})

test('add attributes for a team user profile', async (t) => {
  const team1 = await team.create({ name: 'attribute team test' }, 1)
  await team.addMember(team1.id, 1)

  const name = 'Age'
  const [data] = await profile.addProfileKey({
    name,
    ownerId: team1.id,
    ownerType: 'team'
  })

  t.truthy(data)
  t.is(data.name, name)
  t.is(data.owner_team, team1.id)
})

test('add attributes for an org user profile', async (t) => {
  const org1 = await organization.create({ name: 'attribute organization test' }, 1)
  await team.addMember(org1.id, 1)

  const name = 'Age'
  const [data] = await profile.addProfileKey({
    name,
    ownerId: org1.id,
    ownerType: 'org'
  })

  t.truthy(data)
  t.is(data.name, name)
  t.is(data.owner_org, org1.id)
})

test('delete attribute', async t => {
  const name = 'Favorite T-Shirt'
  const [data] = await profile.addProfileKey({
    name,
    ownerId: 1,
    ownerType: 'user'
  })

  await profile.deleteProfileKey(data.id)
  const notfound = await profile.getProfileKey(data.id)
  t.falsy(notfound)
})

test('get attribute', async t => {
  const name = 'Favorite Park'
  const [data] = await profile.addProfileKey({
    name,
    ownerId: 1,
    ownerType: 'user'
  })

  const key = await profile.getProfileKey(data.id)
  t.truthy(key)
  t.is(key.name, name)
})

test('get attributes for owner', async t => {
  const name1 = 'Favorite Mountain'
  const name2 = 'Favorite City'
  const org2 = await organization.create({ name: 'test get attributes org' }, 1)
  const [data1] = await profile.addProfileKey({
    name: name1,
    ownerId: org2.id,
    ownerType: 'org'
  })

  const [data2] = await profile.addProfileKey({
    name: name2,
    ownerId: org2.id,
    ownerType: 'org'
  })

  const keys = await profile.getProfileKeysForOwner('org', org2.id)
  const ids = map(prop('id'), keys)
  t.true(contains(data1.id, ids))
  t.true(contains(data2.id, ids))
})
