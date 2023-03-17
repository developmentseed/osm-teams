const { default: ApiClient } = require('./api-client')
const logger = require('./logger')

const apiClient = new ApiClient()

/**
 * Get badges from an organization
 *
 * @param {int} orgId - id of the organization
 * @returns {array[badges]}
 */
export async function getOrgBadges(orgId) {
  try {
    const badges = await apiClient.get(`/organizations/${orgId}/badges`)
    return badges
  } catch (e) {
    if (e.statusCode === 401) {
      logger.error("User doesn't have access to organization badges.")
    } else {
      logger.error(e)
    }
  }
}

export async function getUserBadges(userId) {
  try {
    const badges = await apiClient.get(`/user/${userId}/badges`)
    return badges
  } catch (e) {
    if (e.statusCode === 401) {
      logger.error("User doesn't have access to organization badges.")
    } else {
      logger.error(e)
    }
  }
}
