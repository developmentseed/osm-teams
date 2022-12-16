import { teamsMembersModeratorsHelper } from '../../../../../app/manage/utils'
import { createBaseHandler } from '../../../../middlewares/base-handler'
import { validate } from '../../../../middlewares/validation'
import Organization from '../../../../models/organization'
import Team from '../../../../models/team'
import * as Yup from 'yup'
import canViewOrgMembers from '../../../../middlewares/can/view-org-members'
import canCreateOrgTeam from '../../../../middlewares/can/create-org-team'

const handler = createBaseHandler()

/**
 * Validate query params
 */
handler.use(
  validate({
    query: Yup.object({
      orgId: Yup.number().required().positive().integer(),
      page: Yup.number().min(0).integer(),
    }).required(),
  })
)

/**
 * @swagger
 * /organizations/{id}/teams:
 *   post:
 *     summary: Add a team to this organization. Only owners and managers can add new teams.
 *     tags:
 *       - organizations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the organization the teams are part of.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTeam'
 *     responses:
 *       200:
 *         description: Team was added successfully
 *       400:
 *         description: error creating team for organization
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseError'
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
 * @swagger
 * /organizations/{id}/teams:
 *   get:
 *     summary: Get list of teams of an organization
 *     tags:
 *       - organizations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the organization the teams are part of.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of teams.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of teams in the organization.
 *                 items:
 *                   $ref: '#/components/schemas/ArrayOfTeams'
 */
handler.get(canViewOrgMembers, async function (req, res) {
  const { orgId, page } = req.query
  const data = await Team.list({ organizationId: orgId, page })
  const enhancedData = await teamsMembersModeratorsHelper(data)
  const total = await Team.count({ organizationId: orgId })
  return res.send({ data: enhancedData, total })
})

export default handler
