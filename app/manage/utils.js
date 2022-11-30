const team = require('../../src/models/team')
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
async function teamsMembersModeratorsHelper(teamsData) {
  const teamIds = teamsData.map(getId)
  const [members, moderators] = await Promise.all([
    team.listMembers(teamIds),
    team.listModerators(teamIds),
  ])
  return teamsData.map((team) => {
    const predicate = ({ team_id }) => team_id === team.id
    return {
      ...team,
      members: members.filter(predicate).map(getOsmId),
      moderators: moderators.filter(predicate).map(getOsmId),
    }
  })
}

/**
 * Route wrapper to perform validation before processing
 * the request.
 * @param {function} config.validate Yup validation schema
 * @param {function} config.handler Handler to execute if validation pass
 *
 * @returns {function} Route middleware function
 */
function routeWrapper(config) {
  const { validate, handler } = config
  return async (req, reply) => {
    try {
      if (validate.params) {
        req.params = await validate.params.validate(req.params)
      }

      if (validate.body) {
        req.body = await validate.body.validate(req.body)
      }
    } catch (error) {
      console.log(error)
      reply.boom.badRequest(error)
    }
    await handler(req, reply)
  }
}

module.exports = {
  teamsMembersModeratorsHelper,
  routeWrapper,
}
