const { isPublic, isMember, associatedOrg } = require('../../models/team')
const { isOwner } = require('../../models/organization')
import Boom from '@hapi/boom'

/**
 * Permission middleware to view a team's members
 *
 * To view a team's members, the team needs to be either public
 * or the user should be a member of the team
 *
 * @param {object} req The request
 * @param {object} res The response
 * @param {function} next The next middleware
 * @returns the results of the next middleware
 */
export default async function canViewTeamMembers(req, res, next) {
  const { teamId: id } = req.query
  if (!id) {
    throw Boom.badRequest('team id not provided')
  }

  const publicTeam = await isPublic(id)
  if (publicTeam) return next()

  const userId = req.session?.user_id

  try {
    const org = await associatedOrg(id)
    const ownerOfTeam = org && (await isOwner(org.organization_id, userId))

    // You can view the members if you're part of the team, or in case of an org team if you're the owner
    if (ownerOfTeam || (await isMember(id, userId))) {
      return next()
    } else {
      throw Boom.unauthorized()
    }
  } catch (e) {
    throw Boom.badRequest()
  }
}
