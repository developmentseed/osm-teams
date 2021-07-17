
const path = require('path')
const { range, map, contains, prop, propEq, find, includes } = require('ramda')
const test = require('ava')
const db = require('../../db')
const organization = require('../../lib/organization')
const team = require('../../lib/team')
const profile = require('../../lib/profile')
const { ValidationError, PropertyRequiredError } = require('../../lib/utils')
const { DatabaseError } = require('pg-protocol/dist/messages')

const migrationsDirectory = path.join(__dirname, '..', '..', 'db', 'migrations')

test.before(async () => {
  const conn = await db()
  await conn.migrate.latest({ directory: migrationsDirectory })

  // seed
  await conn('users').insert({ id: 1 })
  await conn('users').insert({ id: 2 })
  await conn('users').insert({ id: 3 })
  await conn('users').insert({ id: 4 })
  await conn('users').insert({ id: 5 })
  await conn('users').insert({ id: 6 })
  await conn('users').insert({ id: 7 })
  await conn('users').insert({ id: 8 })
  await conn('users').insert({ id: 9 })
})

test.after.always(async () => {
  const conn = await db()
  await conn.migrate.rollback({ directory: migrationsDirectory })
  conn.destroy()
})

test('add attributes for a public user profile', async (t) => {
  const name = 'Age'
  const visibility = 'public'
  const [data] = await profile.addProfileKeys({
    name,
    ownerId: 1,
    ownerType: 'user',
    profileType: 'user',
    visibility
  })

  t.truthy(data)
  t.is(data.name, name)
  t.is(data.visibility, visibility)
  t.is(data.required, false)
  t.is(data.owner_user, 1)
})

test('adding attribute with same name should fail', async t => {
  const name = 'Test'
  const visibility = 'public'
  await profile.addProfileKeys({
    name,
    ownerId: 1,
    ownerType: 'user',
    profileType: 'user',
    visibility
  })

  await t.throwsAsync(profile.addProfileKeys({
    name,
    ownerId: 1,
    ownerType: 'user',
    profileType: 'user',
    visibility
  }), { instanceOf: DatabaseError, code: '23505' })
})

test('modify attribute', async t => {
  const name = 'Test2'
  const visibility = 'public'
  const [data] = await profile.addProfileKeys({
    name,
    ownerId: 1,
    ownerType: 'user',
    profileType: 'user',
    visibility
  })

  await profile.modifyProfileKey(data.id, { visibility: 'org' })
  const key = await profile.getProfileKey(data.id)
  t.is(key.visibility, 'org')

  // Test that visibility is valid
  await t.throwsAsync(
    profile.modifyProfileKey(data.id, { visibility: 'notValid' }),
    { instanceOf: ValidationError }
  )
})

test('attribute requires name', async (t) => {
  await t.throwsAsync(
    profile.addProfileKeys({ ownerId: 1, ownerType: 'user', profileType: 'user' }),
    { instanceOf: PropertyRequiredError })
})

test('attribute requires ownerType', async (t) => {
  await t.throwsAsync(
    profile.addProfileKeys({ name: 'Age', ownerId: 1, profileType: 'user' }),
    { instanceOf: PropertyRequiredError })
})

test('attribute requires ownerId', async (t) => {
  await t.throwsAsync(
    profile.addProfileKeys({ name: 'Age', ownerType: 'user', profileType: 'user' }),
    { instanceOf: PropertyRequiredError })
})

test('attribute requires profileType', async (t) => {
  await t.throwsAsync(
    profile.addProfileKeys({ name: 'Age', ownerType: 'user' }),
    { instanceOf: PropertyRequiredError })
})

test('ownerType must be valid', async (t) => {
  await t.throwsAsync(
    profile.addProfileKeys({ name: 'Age', ownerId: 1, ownerType: 'notValid', profileType: 'user' }),
    { instanceOf: ValidationError })
})

test('profileType must be valid', async (t) => {
  await t.throwsAsync(
    profile.addProfileKeys({ name: 'Age', ownerId: 1, ownerType: 'user', profileType: 'notValid' }),
    { instanceOf: ValidationError })
})

test('visibility must be valid', async (t) => {
  await t.throwsAsync(
    profile.addProfileKeys({ name: 'Age', ownerId: 1, ownerType: 'user', profileType: 'user', visibility: 'notValid' }),
    { instanceOf: ValidationError })
})

test('add attributes for a team user profile', async (t) => {
  const team1 = await team.create({ name: 'attribute team test' }, 1)
  await team.addMember(team1.id, 1)

  const name = 'Age'
  const [data] = await profile.addProfileKeys({
    name,
    ownerId: team1.id,
    ownerType: 'team',
    profileType: 'user'
  })

  t.truthy(data)
  t.is(data.name, name)
  t.is(data.owner_team, team1.id)
})

test('add attributes for an org user profile', async (t) => {
  const org1 = await organization.create({ name: 'attribute organization test' }, 1)

  const name = 'Age'
  const [data] = await profile.addProfileKeys({
    name,
    ownerId: org1.id,
    ownerType: 'org',
    profileType: 'user'
  })

  t.truthy(data)
  t.is(data.name, name)
  t.is(data.owner_org, org1.id)
})

test('delete attribute', async t => {
  const name = 'Favorite T-Shirt'
  const [data] = await profile.addProfileKeys({
    name,
    ownerId: 1,
    ownerType: 'user',
    profileType: 'user'
  })

  await profile.deleteProfileKey(data.id)
  const notfound = await profile.getProfileKey(data.id)
  t.falsy(notfound)
})

test('get attribute', async t => {
  const name = 'Favorite Park'
  const [data] = await profile.addProfileKeys({
    name,
    ownerId: 1,
    ownerType: 'user',
    profileType: 'user'
  })

  const key = await profile.getProfileKey(data.id)
  t.truthy(key)
  t.is(key.name, name)
})

test('get attributes for owner', async t => {
  const name1 = 'Favorite Mountain'
  const name2 = 'Favorite City'
  const org2 = await organization.create({ name: 'test get attributes org' }, 1)
  const [data1] = await profile.addProfileKeys({
    name: name1,
    ownerId: org2.id,
    ownerType: 'org',
    profileType: 'user'
  })

  const [data2] = await profile.addProfileKeys({
    name: name2,
    ownerId: org2.id,
    ownerType: 'org',
    profileType: 'user'
  })

  const keys = await profile.getProfileKeysForOwner('org', org2.id)
  const ids = map(prop('id'), keys)
  t.true(contains(data1.id, ids))
  t.true(contains(data2.id, ids))

  // Test invalid ownerType
  await t.throwsAsync(profile.getProfileKeysForOwner('notValid', org2.id), { instanceOf: ValidationError })
})

test('set attribute for profile', async t => {
  const name1 = 'Favorite Fruit'
  const name2 = 'Favorite Website'
  const value1 = 'Apple'
  const value2 = 'openstreetmap.org'

  await profile.addProfileKeys([
    { name: name1, ownerType: 'user', ownerId: 4, profileType: 'user' },
    { name: name2, ownerType: 'user', ownerId: 4, profileType: 'user' }
  ])

  const conn = await db()

  // Get the keys
  const keys = await profile.getProfileKeysForOwner('user', 4)

  // Map keys to ids
  const toInsertId1 = find(propEq('name', name1))(keys).id
  const toInsertId2 = find(propEq('name', name2))(keys).id

  const timeNow = new Date()
  await profile.setProfile([
    { key_id: toInsertId1, value: value1 },
    { key_id: toInsertId2, value: value2 }
  ], 'user', 4)

  const user = (await conn('users').where('id', 4))[0]

  const userTags = user.profile.tags
  t.is(Object.keys(userTags).length, 2)
  t.is(userTags[toInsertId1], value1)
  t.is(userTags[toInsertId2], value2)
  t.is(Math.floor(user.updated_at.getTime() / 1000), Math.floor(timeNow.getTime() / 1000)) // compare seconds
})

test('set attribute for profile - upsert', async t => {
  const name1 = 'Favorite Fruit'
  const value1 = 'Apple'
  const value2 = 'Orange'

  await profile.addProfileKeys([
    { name: name1, ownerType: 'user', ownerId: 3, profileType: 'user' }
  ])

  // Get the keys
  const keys = await profile.getProfileKeysForOwner('user', 3)

  // Map keys to ids
  const toInsertId1 = find(propEq('name', name1))(keys).id

  await profile.setProfile([
    { key_id: toInsertId1, value: value1, user_id: 3 }
  ], 'user', 3)

  await profile.setProfile([
    { key_id: toInsertId1, value: value2, user_id: 3 }
  ], 'user', 3)

  const conn = await db()
  const [user] = await conn('users').where('id', 3)

  t.is(user.profile.tags[toInsertId1], value2)
})

test('set attribute for profile - invalid params', async t => {
  const name = 'Missing parameter - set attribute'

  const [data] = await profile.addProfileKeys({ name, ownerType: 'user', ownerId: 1, profileType: 'user' })

  await t.throwsAsync(
    profile.setProfile(
      { key_id: data.id, value: 'Missing parameter' }),
    { instanceOf: PropertyRequiredError }
  )

  await t.throwsAsync(
    profile.setProfile(
      { key_id: data.id, value: 'Missing parameter' },
      'user'),
    { instanceOf: PropertyRequiredError }
  )

  await t.throwsAsync(
    profile.setProfile(
      { key_id: data.id, value: 'Missing parameter' },
      'invalid', 7),
    { instanceOf: ValidationError }
  )
})

test('get profile for user', async t => {
  t.plan(10)

  const names = range(1, 11).map(x => `name_${x}`)

  const attributesToInsert = names.map(name => ({
    name,
    ownerType: 'user',
    ownerId: 1,
    profileType: 'user'
  }))

  const keys = await profile.addProfileKeys(attributesToInsert)

  // Let's insert a value for each of the above attributes
  // We set the value to include the id of the key
  const valuesToInsert = keys.map(key => ({
    key_id: key.id,
    value: `value_${key.id}`
  }))
  await profile.setProfile(valuesToInsert, 'user', 5)
  await profile.setProfile(valuesToInsert, 'user', 9)

  // Get profile values for above keys for user 5
  const tags = prop('tags', await profile.getProfile('user', 5))

  // Each value should contain the id of the key
  Object.keys(tags).forEach(key => {
    t.true(includes(key, tags[key]))
  })
})

test('get profile - invalid parameters', async t => {
  const name = 'Missing parameter'

  const [data] = await profile.addProfileKeys({ name, ownerType: 'user', ownerId: 1, profileType: 'user' })
  await profile.setProfile({ key_id: data.id, value: 'Missing parameter' }, 'user', 7)

  await t.throwsAsync(
    profile.getProfile('invalid', 1),
    { instanceOf: ValidationError }
  )

  await t.throwsAsync(
    profile.getProfile('user'),
    { instanceOf: PropertyRequiredError }
  )

  await t.throwsAsync(
    profile.getProfile(),
    { instanceOf: PropertyRequiredError }
  )
})
