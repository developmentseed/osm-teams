import Boom from '@hapi/boom'
import { isMemberOrStaff, isPublic } from '../../models/organization'

/**
 * Validation middleware
 * @param {function} config.schema Yup validation schema
 * @param {function} config.handler Handler to execute if validation pass
 *
 * @returns {function} Route middleware function
 */
export default async function canViewOrgMembers(req, res, next) {
  const { orgId } = req.query
  const { user_id: userId } = req.session

  if (await isPublic(orgId)) {
    // Can view if org is public
    return next()
  } else if (await isMemberOrStaff(orgId, userId)) {
    // Can view if is member or staff
    return next()
  } else {
    throw Boom.unauthorized()
  }
}
