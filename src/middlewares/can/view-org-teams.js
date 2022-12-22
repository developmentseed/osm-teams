import Boom from '@hapi/boom'
import Organization from '../../models/organization'

/**
 * Permission middleware to check if user can view organization teams.
 * Add permission flags to request object (isMember, isManager, isOwner)
 * @param {object} req The request
 * @param {object} res The response
 * @param {function} next The next middleware
 * @returns The results of the next middleware
 */
export default async function canViewOrgTeams(req, res, next) {
  const { orgId } = req.query
  const userId = req.session?.user_id

  let [org, isMember, isManager, isOwner] = await Promise.all([
    Organization.get(orgId),
    Organization.isMember(orgId, userId),
    Organization.isManager(orgId, userId),
    Organization.isOwner(orgId, userId),
  ])

  if (org?.privacy === 'public' || isMember || isManager || isOwner) {
    // Add org and permission flags to request
    req.org = { ...org, isMember, isManager, isOwner }
    return next()
  } else {
    throw Boom.unauthorized()
  }
}
