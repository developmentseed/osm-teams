const path = require('path')
const test = require('ava')

const db = require('../db')
const server = require('../index')()

const migrationsDirectory = path.join(__dirname, '..', 'db', 'migrations')

test.before(async () => {
  await db.migrate.latest({ directory: migrationsDirectory })
})

test.after.always(async () => {
  await db.migrate.rollback({ directory: migrationsDirectory })
  db.destroy()
  server.close()
})

function getTeam (id, callback) {
  server.inject({
    method: 'GET',
    url: `/api/teams/${id}`,
  }, callback)
}

function getTeamList (callback) {
  server.inject({
    method: 'GET',
    url: '/api/teams',
  }, callback)
}

function createTeam (body, callback) {
  server.inject({
    method: 'POST',
    url: '/api/teams',
    payload: body
  }, callback)
}

function updateTeam (id, body, callback) {
  server.inject({
    method: 'PUT',
    url: `/api/teams/${id}`,
    payload: body
  }, callback)
}

function destroyTeam (id, callback) {
  server.inject({
    method: 'DELETE',
    url: `/api/teams/${id}`
  }, callback)
}

test.cb('create a team', (t) => {
  createTeam({ name: 'road team' }, (err, response) => {
    t.falsy(err)
    const { payload, headers, statusCode } = response
    const data = JSON.parse(payload)
    t.true(statusCode === 200)
    t.true(headers['content-type'] === 'application/json; charset=utf-8')
    t.true(data.name === 'road team')
    t.end()
  })
})

test.cb('update a team', (t) => {
  createTeam({ name: 'map team' }, (err, response) => {
    t.falsy(err)
    const { payload, statusCode } = response
    const data = JSON.parse(payload)
    t.true(statusCode === 200)
    t.true(data.name === 'map team')

    updateTeam(data.id, { name: 'poi team' }, (err, response) => {
      t.falsy(err)
      const { payload, statusCode } = response
      const updated = JSON.parse(payload)
      t.true(statusCode === 200)
      t.true(updated.name === 'poi team')
      t.end()
    })
  })
})

test.cb('destroy a team', (t) => {
  createTeam({ name: 'map team' }, (err, response) => {
    t.falsy(err)
    const { payload, statusCode } = response
    const data = JSON.parse(payload)
    t.true(statusCode === 200)
    t.true(data.name === 'map team')

    destroyTeam(data.id, (err, response) => {
      t.falsy(err)
      t.true(response.statusCode === 200)
      t.end()
    })
  })
})

test.cb('get a team', (t) => {
  createTeam({ name: 'map team' }, (err, response) => {
    t.falsy(err)
    const { payload, statusCode } = response
    const data = JSON.parse(payload)
    t.true(statusCode === 200)

    getTeam(data.id, (err, response) => {
      t.falsy(err)
      const { payload, headers, statusCode } = response
      const retrieved = JSON.parse(payload)
      t.true(statusCode === 200)
      t.true(headers['content-type'] === 'application/json; charset=utf-8')
      t.true(retrieved.id === data.id)
      t.end()
    })
  })
})

test.cb('get team list', (t) => {
  createTeam({ name: 'map team' }, (err, response) => {
    t.falsy(err)
    t.true(response.statusCode === 200)

    getTeamList((err, response) => {
      t.falsy(err)
      const { payload, headers, statusCode } = response
      const data = JSON.parse(payload)
      t.true(statusCode === 200)
      t.true(headers['content-type'] === 'application/json; charset=utf-8')
      t.true(data.length > 0)
      data.forEach((item) => {
        t.truthy(item.name)
        t.truthy(item.id)
      })
      t.end()
    })
  })
})
