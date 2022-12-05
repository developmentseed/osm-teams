const db = require('../lib/db')
const crypto = require('crypto')

async function create({ uuid, teamId, createdAt, expiresAt }) {
  const [invitation] = await db('invitations')
    .insert({
      id: uuid || crypto.randomUUID(),
      team_id: teamId,
      created_at: createdAt,
      expires_at: expiresAt,
    })
    .returning('*')
  return invitation
}

async function get({ id, teamId }) {
  const [invitation] = await db('invitations')
    .select()
    .where({ id, team_id: teamId })
  return invitation
}

module.exports = {
  create,
  get,
}
