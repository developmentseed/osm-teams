import { createBaseHandler } from '../../../../middlewares/base-handler'
import { validate } from '../../../../middlewares/validation'
import Team from '../../../../models/team'
import * as Yup from 'yup'
import { split, includes } from 'ramda'
import canViewTeamMembers from '../../../../middlewares/can/view-team-members'

const handler = createBaseHandler()

const fieldsTransform = Yup.string().transform(split(','))

/**
 * @swagger
 * /teams/{id}/members:
 *   get:
 *     summary: Get members in a team
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
 *         description: A list of members
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
      fields: fieldsTransform.isType(Yup.array().of(Yup.string().min(1))),
    }).required(),
  }),
  async function (req, res) {
    const { teamId, fields } = req.query

    const parsedFields = split(',', fields || '')
    const includeBadges = parsedFields && includes('badges', parsedFields)
    const members = await Team.getMembersPaginated(teamId, {
      badges: includeBadges,
    })

    let responseObject = Object.assign({}, { teamId }, { members })

    return res.send(responseObject)
  }
)

export default handler
