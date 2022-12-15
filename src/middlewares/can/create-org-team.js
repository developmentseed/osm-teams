import Boom from '@hapi/boom'
import { isManager, isOwner } from '../../models/organization'

/**
 * organization:create-team
 *
 * To create a team within an organization, you have to be
 * a manager of the organization
 *
 * @param {int} uid - user id
 * @param {Object} params - request parameters
 * @param {int} params.id - organization id
 * @returns {Promise<boolean>}
 */
export default async function canCreateOrgTeam(req, res, next) {
  const { orgId } = req.query
  const { user_id: userId } = req.session

  // Must be owner or manager
  if (!(await isOwner(orgId, userId)) && !(await isManager(orgId, userId))) {
    throw Boom.unauthorized()
  } else {
    next()
  }
}
