const db = require('../../src/lib/db')

async function resetDb() {
  const conn = await db()
  await conn.raw('TRUNCATE TABLE team RESTART IDENTITY CASCADE')
  await conn.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE')
}

async function disconnectDb() {
  const conn = await db()
  return conn.destroy()
}

module.exports = {
  resetDb,
  disconnectDb,
}
