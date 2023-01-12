const getSessionToken = require('./get-session-token')

async function createAgent(user, http = false) {
  const agent = require('supertest').agent('http://localhost:3000')

  if (user) {
    const encryptedToken = await getSessionToken(
      user,
      process.env.NEXTAUTH_SECRET
    )
    if (http) {
      agent.set('Authorization', `Bearer ${encryptedToken}`)
    }
    agent.set('Cookie', [`next-auth.session-token=${encryptedToken}`])
  }

  return agent
}

module.exports = createAgent
