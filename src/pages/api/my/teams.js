import * as Yup from 'yup'
import Team from '../../../models/team'
import { createBaseHandler } from '../../../middlewares/base-handler'
import { validate } from '../../../middlewares/validation'

const handler = createBaseHandler()

/**
 * @swagger
 * /api/my/teams:
 *   get:
 *     summary: Get list of teams the logged user is member or moderator
 *     tags:
 *       - teams
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
 *                   description: Total number of teams
 *                 items:
 *                   $ref: '#/components/schemas/ArrayOfTeams'
 */
handler.get(
  validate({
    query: Yup.object({
      page: Yup.number().min(0).integer(),
    }),
  }),
  async function (req, res) {
    const { page } = req.query
    const { user_id: osmId } = req.session

    return res.send(await Team.list({ osmId, page }))
  }
)

export default handler
