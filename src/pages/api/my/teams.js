import * as Yup from 'yup'
import Team from '../../../models/team'
import { createBaseHandler } from '../../../middlewares/base-handler'
import { validate } from '../../../middlewares/validation'
import logger from '../../../lib/logger'

const handler = createBaseHandler()

/**
 * @swagger
 * /my/teams:
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
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 data:
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
    const userId = req.session?.user_id
    logger.info('req.session', req.session)

    return res.send(await Team.paginatedList({ osmId: userId, page }))
  }
)

export default handler
