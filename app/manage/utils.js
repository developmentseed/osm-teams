const team = require('../lib/team')
const { prop } = require('ramda')

const getId = prop('id')
const getOsmId = prop('osm_id')

/**
 * Helper function for teams and organizations. Enhances teamsData with list of
 * moderator ids and list of member ids.
 *
 * @param {Object[]} teamsData
 * @returns {Promise<*>}
 * @async
 */
async function teamsMembersModeratorsHelper (teamsData) {
  const teamIds = teamsData.map(getId)
  const [members, moderators] = await Promise.all([
    team.listMembers(teamIds),
    team.listModerators(teamIds)
  ])
  return teamsData.map(team => {
    const predicate = ({ team_id }) => team_id === team.id
    return {
      ...team,
      members: members.filter(predicate).map(getOsmId),
      moderators: moderators.filter(predicate).map(getOsmId)
    }
  })
}

module.exports = {
  teamsMembersModeratorsHelper
}
