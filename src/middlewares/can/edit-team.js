const { isModerator, associatedOrg } = require('../../../src/models/team')
const { isOwner } = require('../../../src/models/organization')
const Boom = require('@hapi/boom')

/**
 * team:update
 *
 * To update a team, the authenticated user needs to
 * be a moderator of the team or an owner of the organization
 * that the team is associated to
 *
 * @returns {Promise}
 */
async function canEditTeam(req, res, next) {
  const { teamId } = req.query
  // user has to be authenticated
  const userId = req.session?.user_id
  if (!userId) throw Boom.unauthorized()

  // check if user is an owner of this team through an organization
  const org = await associatedOrg(teamId)
  const ownerOfTeam = org && (await isOwner(org.organization_id, userId))

  if (ownerOfTeam || (await isModerator(teamId, userId))) {
    return next()
  } else {
    throw Boom.unauthorized()
  }
}

module.exports = canEditTeam
