const db = require('../../db')

module.exports = async function ({ user_id }) {
  let conn = await db()
  const [user] = await conn('users').where('id', user_id)
  if (user) {
    console.log(user)
  }
  return true
}
