const path = require('path')
const test = require('ava')
const db = require('../../db')
const team = require('../../lib/team')

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

test('create a team', async (t) => {
  const data = await team.create({ name: 'map team 1' }, 1)
  const members = await team.getMembers(data.id)
  t.truthy(data)
  t.is(data.name, 'map team 1')
  t.is(members.length, 1)
  t.is(members[0].osm_id, 1)
  t.true(await team.isModerator(data.id, 1))
})

test('list teams', async (t) => {
  const list = await team.list()
  t.true(Array.isArray(list) && list.length > 0)
  list.forEach((item) => {
    t.truthy(item.name)
    t.truthy(item.id)
  })
})

test('update a team', async (t) => {
  const data = await team.create({ name: 'poi team 1' }, 1)
  const updated = await team.update(data.id, { name: 'road team 1' })
  t.true(updated.name === 'road team 1')
})

test('destroy a team', async (t) => {
  const data = await team.create({ name: 'poi team 2' }, 1)
  await team.addMember(data.id, 1)
  await team.addMember(data.id, 2)
  await team.destroy(data.id)
  const notfound = await team.get(data.id)
  const members = await team.getMembers(data.id)
  t.falsy(notfound)
  t.is(members.length, 0)
})

test('get a team', async (t) => {
  const created = await team.create({ name: 'boundary team 1' }, 1)
  const data = await team.get(created.id)
  t.truthy(data)
  t.true(data.name === 'boundary team 1')
})

test('get team members', async t => {
  const created = await team.create({ name: 'boundary team 2' }, 1)
  const members = await team.getMembers(created.id)
  t.truthy(members)
  t.is(members.length, 1)
})

test('add team member', async t => {
  const created = await team.create({ name: 'boundary team 3' }, 1)
  await team.addMember(created.id, 1)
  await team.addMember(created.id, 2)
  const members = await team.getMembers(created.id)
  t.truthy(members)
  t.true(members.length === 2)
})

test('remove team member', async t => {
  const created = await team.create({ name: 'boundary team 4' }, 1)
  await team.addMember(created.id, 1)
  const members = await team.getMembers(created.id)
  t.true(members.length === 1)

  await team.removeMember(created.id, 1)
  const newMembers = await team.getMembers(created.id)
  t.true(newMembers.length === 0)
})

test('update team members', async t => {
  const created = await team.create({ name: 'boundary team 5' }, 1)
  await team.addMember(created.id, 1)
  await team.addMember(created.id, 4)
  await team.updateMembers(created.id, [1, 2, 3], [4])
  const members = await team.getMembers(created.id)
  t.truthy(members)
  t.is(members.length, 3)
})

test('list teams a user belongs to', async (t) => {
  const created = await team.create({ name: 'boundary team 6' }, 1)
  await team.addMember(created.id, 1)
  const list = await team.findByOsmId(1)

  t.true(Array.isArray(list) && list.length > 0)
  list.forEach((item) => {
    t.truthy(item.name)
    t.truthy(item.id)
  })
})
