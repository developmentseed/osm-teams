import { createBaseHandler } from '../../../../middlewares/base-handler'
import { validate } from '../../../../middlewares/validation'
import Team from '../../../../models/team'
import * as Yup from 'yup'
import canViewTeamMembers from '../../../../middlewares/can/view-team-members'
const handler = createBaseHandler()

/**
 * @swagger
 * /teams/{id}/moderators:
 *   get:
 *     summary: Get moderators in a team
 *     tags:
 *       - teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Team id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of moderators
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 data:
 *                   $ref: '#/components/schemas/TeamMemberList'
 */
handler.get(
  canViewTeamMembers,
  validate({
    query: Yup.object({
      teamId: Yup.number().required().positive().integer(),
    }).required(),
  }),
  async function (req, res) {
    const { teamId } = req.query

    const moderators = await Team.getModerators(teamId)

    return res.send(moderators)
  }
)

export default handler
