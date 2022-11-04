const { isPublic, isMember, associatedOrg } = require('../../lib/team')
const { isOwner } = require('../../lib/organization')

/**
 * team:view-members
 *
 * To view a team's members, the team needs to be either public
 * or the user should be a member of the team
 *
 * @param {string} uid user id
 * @param {Object} params request parameters
 * @returns {boolean} can the request go through?
 */
async function viewTeamMembers(uid, { id }) {
  const publicTeam = await isPublic(id)
  if (publicTeam) return publicTeam

  try {
    const org = await associatedOrg(id)
    const ownerOfTeam = org && (await isOwner(org.organization_id, uid))

    // You can view the members if you're part of the team, or in case of an org team if you're the owner
    return ownerOfTeam || (await isMember(id, uid))
  } catch (e) {
    return false
  }
}

module.exports = viewTeamMembers
