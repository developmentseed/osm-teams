const profile = require('../lib/profile')
const team = require('../lib/team')
const org = require('../lib/organization')

/**
 * Gets a user profile
 */
async function getUserTeamProfile (req, reply) {
  const { osmId, id: teamId } = req.query
  const { user_id: requesterId } = reply.locals

  if (!osmId) {
    reply.boom.badRequest('osmId is required parameter')
  }

  try {
    let visibleKeys = []
    let teamKeys = []
    let orgKeys = []
    let requesterIsMemberOfTeam = false
    let requesterIsMemberOfOrg = false

    // Get team attributes
    teamKeys = await profile.getProfileKeysForOwner('team', teamId)
    requesterIsMemberOfTeam = await team.isMember(teamId, requesterId) // Is the requester part of this team?

    // Get org keys & visibility
    const associatedOrg = await team.associatedOrg(teamId) // Is the team part of an organization?
    if (associatedOrg) {
      orgKeys = await profile.getProfileKeysForOwner('org', associatedOrg)
      requesterIsMemberOfOrg = org.isMember(associatedOrg, requesterId)
    }

    // Get visibile keys
    const allKeys = teamKeys.concatenate(orgKeys)
    allKeys.forEach(({ key_id, visibility }) => {
      switch (visibility) {
        case 'public': {
          visibleKeys.push(key_id)
          break
        }
        case 'team': {
          if (requesterIsMemberOfTeam) {
            visibleKeys.push(key_id)
          }
          break
        }
        case 'org': {
          if (requesterIsMemberOfOrg) {
            visibleKeys.push(key_id)
          }
          break
        }
      }
    })

    // Get values for keys
    const values = await profile.getProfileValues(visibleKeys, osmId)

    reply.send(values)
  } catch (err) {
    console.error(err)
    return reply.boom.badImplementation()
  }
}

module.exports = {
  getUserTeamProfile
}
