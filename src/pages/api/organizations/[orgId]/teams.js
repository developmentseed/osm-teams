import { teamsMembersModeratorsHelper } from '../../../../../app/manage/utils'
import baseHandler from '../../../../middlewares/base-handler'
import { validate } from '../../../../middlewares/validation'
import Organization from '../../../../models/organization'
import Team from '../../../../models/team'
import * as Yup from 'yup'
import canViewOrgMembers from '../../../../middlewares/can/view-org-members'
import canCreateOrgTeam from '../../../../middlewares/can/create-org-team'

const handler = baseHandler

/**
 * Validate query params
 */
handler.use(
  validate({
    query: Yup.object({
      orgId: Yup.number().required().positive().integer(),
    }).required(),
  })
)

/**
 * Create organization team
 */
handler.post(
  canCreateOrgTeam,
  validate({
    body: Yup.object({
      name: Yup.string().required(),
      location: Yup.string(),
    }).required(),
  }),
  async (req, res) => {
    const { orgId } = req.query
    const { user_id: userId } = req.session
    const { name, location } = req.body

    const data = await Organization.createOrgTeam(
      orgId,
      { name, location },
      userId
    )
    return res.send(data)
  }
)

/**
 * Get organization teams
 */
handler.get(canViewOrgMembers, async function (req, res) {
  const { orgId } = req.query
  const data = await Team.list({ organizationId: orgId })
  const enhancedData = await teamsMembersModeratorsHelper(data)
  return res.send(enhancedData)
})

export default handler
