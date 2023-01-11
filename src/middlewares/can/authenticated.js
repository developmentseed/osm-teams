import Boom from '@hapi/boom'

/**
 * Authenticated
 *
 * To view this route you must be authenticated
 *
 * @returns {Promise<boolean>}
 */
export default async function isAuthenticated(req, res, next) {
  const userId = req.session?.user_id

  // Must be owner or manager
  if (!userId) {
    throw Boom.unauthorized()
  } else {
    next()
  }
}
