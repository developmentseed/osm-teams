import { createBaseHandler } from '../../../../middlewares/base-handler'
import { validate } from '../../../../middlewares/validation'
import Team from '../../../../models/team'
import Boom from '@hapi/boom'
import { assoc } from 'ramda'
import * as Yup from 'yup'

const handler = createBaseHandler()

/**
 * @swagger
 * /teams/{id}:
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
 *              $ref: '#/components/schemas/Team'
 *
 */
handler.get(
  validate({
    query: Yup.object({
      teamId: Yup.number().required().positive().integer(),
    }).required(),
  }),
  async function (req, res) {
    const { teamId } = req.query
    const teamData = await Team.get(teamId)

    if (!teamData) {
      throw Boom.notFound()
    }

    const associatedOrg = await Team.associatedOrg(teamId)
    let responseObject = Object.assign({}, teamData, { org: associatedOrg })

    const { user_id: userId } = req.session
    let requesterId = userId
    if (requesterId) {
      const isMember = await Team.isMember(teamId, requesterId)
      if (isMember) {
        responseObject = assoc('requesterIsMember', true, responseObject)
      }
    }

    return res.send(responseObject)
  }
)

export default handler
