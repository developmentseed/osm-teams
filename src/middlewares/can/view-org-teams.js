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

  if (!orgId) {
    throw Boom.badRequest('organization id not provided')
  }

  let org = await Organization.get(orgId)

  const userId = req.session?.user_id

  if (userId) {
    let [isMember, isManager, isOwner] = await Promise.all([
      Organization.isMember(orgId, userId),
      Organization.isManager(orgId, userId),
      Organization.isOwner(orgId, userId),
    ])
    if (org?.privacy === 'public' || isMember || isManager || isOwner) {
      // Add org and permission flags to request
      req.org = { ...org, isMember, isManager, isOwner }
      return next()
    }
  } else {
    if (org?.privacy === 'public') {
      req.org = { ...org }
      return next()
    }
  }

  throw Boom.unauthorized()
}
