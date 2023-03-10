import { createBaseHandler } from '../../../../middlewares/base-handler'
import { validate } from '../../../../middlewares/validation'
import Team from '../../../../models/team'
import * as Yup from 'yup'
import { split, includes } from 'ramda'
import canViewTeamMembers from '../../../../middlewares/can/view-team-members'
import canEditTeam from '../../../../middlewares/can/edit-team'
import Boom from '@hapi/boom'
import logger from '../../../../lib/logger'

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
  async function getMembers(req, res) {
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

/**
 * @swagger
 * /teams/{id}/members:
 *   patch:
 *     summary: Update members in a team
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
 *         description: Members updated successfully
 */
handler.patch(
  canEditTeam,
  validate({
    query: Yup.object({
      teamId: Yup.number().required().positive().integer(),
    }),
    body: Yup.object({
      add: Yup.array(),
      remove: Yup.array(),
    }).test(
      'at-least-add-or-remove',
      'You must provide osm ids',
      (value) => !!(value.add || value.remove)
    ),
  }),
  async function updateMembers(req, res) {
    const { teamId } = req.query
    const { add, remove } = req.body

    try {
      let members = []
      if (add) {
        members = members.concat(add)
      }
      if (remove) {
        members = members.concat(remove)
      }
      // Check if these are OSM users
      await Team.resolveMemberNames(members)

      await Team.updateMembers(teamId, add, remove)
      return res.status(200).send()
    } catch (err) {
      logger.error(err)
      throw Boom.badRequest(err.message)
    }
  }
)

export default handler
