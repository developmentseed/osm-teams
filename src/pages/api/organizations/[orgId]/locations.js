import { createBaseHandler } from '../../../../middlewares/base-handler'
import { validate } from '../../../../middlewares/validation'
import Team from '../../../../models/team'
import * as Yup from 'yup'
import canViewOrgTeams from '../../../../middlewares/can/view-org-teams'

const handler = createBaseHandler()

/**
 * @swagger
 * /organizations/{id}/teams:
 *   get:
 *     summary: Get locations of teams of an organization
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
 *                properties:
 *                 data:
 *                   $ref: '#/components/schemas/ArrayOfTeams'
 */
handler.get(
  canViewOrgTeams,
  validate({
    query: Yup.object({
      orgId: Yup.number().required().positive().integer(),
    }).required(),
  }),
  async function (req, res) {
    const { orgId } = req.query
    const {
      org: { isMember, isOwner, isManager },
    } = req
    const teamList = await Team.list({
      organizationId: orgId,
      includePrivate: isMember || isManager || isOwner,
    })

    return res.send({ data: teamList })
  }
)

export default handler
