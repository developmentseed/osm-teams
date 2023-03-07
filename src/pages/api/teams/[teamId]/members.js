import { createBaseHandler } from '../../../../middlewares/base-handler'
import { validate } from '../../../../middlewares/validation'
import Team from '../../../../models/team'
import * as Yup from 'yup'
import { map, prop, split } from 'ramda'
import canViewTeamMembers from '../../../../middlewares/can/view-team-members'

const handler = createBaseHandler()

const fieldsTransform = Yup.string().transform(split(','))

handler.get(
  canViewTeamMembers,
  validate({
    query: Yup.object({
      teamId: Yup.number().required().positive().integer(),
      fields: fieldsTransform.isType(Yup.array().of(Yup.string().min(1))),
    }).required(),
  }),
  async function (req, res) {
    const { teamId } = req.query

    // TODO implement
    // const parsedFields = split(',', fields)
    // const includeBadges = parsedFields && includes('badges', parsedFields)
    // const members = await Team.getMembersPaginated(teamId, { includeBadges })

    const memberIds = map(prop('osm_id'), await Team.getMembers(teamId))
    const members = await Team.resolveMemberNames(memberIds)
    const moderators = await Team.getModerators(teamId)

    let responseObject = Object.assign({}, { teamId }, { members, moderators })

    return res.send(responseObject)
  }
)

export default handler
