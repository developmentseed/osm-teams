const path = require('path')
const test = require('ava')
const db = require('../db')
const team = require('../lib/team')

const migrationsDirectory = path.join(__dirname, '..', 'db', 'migrations')

test.before(async () => {
  await db.migrate.latest({ directory: migrationsDirectory })
})

test.after.always(async () => {
  await db.migrate.rollback({ directory: migrationsDirectory })
  db.destroy()
})

test('create a team', async (t) => {
  const [data] = await team.create({ name: 'map team 1' })
  t.truthy(data)
  t.true(data.name === 'map team 1')
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
  const [data] = await team.create({ name: 'poi team 1' })
  const [updated] = await team.update(data.id, { name: 'road team 1' })
  t.true(updated.name === 'road team 1')
})

test('destroy a team', async (t) => {
  const [data] = await team.create({ name: 'poi team 2' })
  await team.addMember(data.id, 1)
  await team.addMember(data.id, 2)
  await team.destroy(data.id)
  const [notfound] = await team.get(data.id)
  const members = await team.getMembers(data.id)
  t.falsy(notfound)
  t.true(members.length === 0)
})

test('get a team', async (t) => {
  const [created] = await team.create({ name: 'boundary team 1' })
  const [data] = await team.get(created.id)
  t.truthy(data)
  t.true(data.name === 'boundary team 1')
})

test('get team members', async t => {
  const [created] = await team.create({ name: 'boundary team 2' })
  const members = await team.getMembers(created.id)
  t.truthy(members)
  t.true(members.length === 0)
})

test('add team member', async t => {
  const [created] = await team.create({ name: 'boundary team 3' })
  await team.addMember(created.id, 1)
  await team.addMember(created.id, 2)
  const members = await team.getMembers(created.id)
  t.truthy(members)
  t.true(members.length === 2)
})

test('remove team member', async t => {
  const [created] = await team.create({ name: 'boundary team 4' })
  await team.addMember(created.id, 1)
  const members = await team.getMembers(created.id)
  t.true(members.length === 1)

  await team.removeMember(created.id, 1)
  const newMembers = await team.getMembers(created.id)
  t.true(newMembers.length === 0)
})

test('update team members', async t => {
  const [created] = await team.create({ name: 'boundary team 5' })
  await team.addMember(created.id, 1)
  await team.addMember(created.id, 4)
  await team.updateMembers(created.id, [1, 2, 3], [4])
  const members = await team.getMembers(created.id)
  t.truthy(members)
  t.true(members.length === 3)
})

test('list teams a user belongs to', async (t) => {
  const [created] = await team.create({ name: 'boundary team 6' })
  await team.addMember(created.id, 1)
  const list = await team.findByOsmId(1)

  t.true(Array.isArray(list) && list.length > 0)
  list.forEach((item) => {
    t.truthy(item.name)
    t.truthy(item.id)
  })
})

test('add team moderator', async t => {
  const [created] = await team.create({ name: 'boundary team 7' })
  await team.addModerator(created.id, 1)
  const moderators = await team.getModerators(created.id)
  t.truthy(moderators)
  t.true(moderators.length === 1)
})

test('remove team moderator', async t => {
  const [created] = await team.create({ name: 'boundary team 8' })
  await team.addModerator(created.id, 1)
  const moderators = await team.getModerators(created.id)
  t.true(moderators.length === 1)

  await team.removeModerator(created.id, 1)
  const updatedModerators = await team.getModerators(created.id)
  t.true(updatedModerators.length === 0)
})

test('check if user is team moderator', async t => {
  const [created] = await team.create({ name: 'boundary team 9' })
  await team.addModerator(created.id, 1)
  t.true(await team.isModerator(created.id, 1))
  t.false(await team.isModerator(created.id, 2))
})
