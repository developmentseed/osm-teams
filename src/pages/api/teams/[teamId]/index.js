import { createBaseHandler } from '../../../../middlewares/base-handler'
import { validate } from '../../../../middlewares/validation'
import Team from '../../../../models/team'
import Profile from '../../../../models/profile'
import Boom from '@hapi/boom'
import * as Yup from 'yup'
import { prop, dissoc } from 'ramda'
import canEditTeam from '../../../../middlewares/can/edit-team'

const handler = createBaseHandler()

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get a team's metadata
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
    responseObject.requesterIsMember = false

    const requesterId = req.session?.user_id
    if (requesterId) {
      const isMember = await Team.isMember(teamId, requesterId)
      if (isMember) {
        responseObject.requesterIsMember = true
      }
    }

    return res.send(responseObject)
  }
)

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Update team metadata
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
handler.put(
  canEditTeam,
  validate({
    query: Yup.object({
      teamId: Yup.number().required().positive().integer(),
    }).required(),
    body: Yup.object({
      editing_policy: Yup.string().url(),
    }),
  }),
  async function updateTeam(req, res) {
    const { teamId } = req.query
    const body = req.body
    const tags = prop('tags', body)
    if (tags) {
      await Profile.setProfile(tags, 'team', teamId)
    }
    const teamData = dissoc('tags', body)
    let updatedTeam = {}
    if (teamData) {
      updatedTeam = await Team.update(teamId, teamData)
    }
    res.send(updatedTeam)
  }
)

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Update team metadata
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
 *        description: The resource was deleted successfully
 */
handler.delete(
  canEditTeam,
  validate({
    query: Yup.object({
      teamId: Yup.number().required().positive().integer(),
    }).required(),
  }),
  async function destroyTeam(req, res) {
    const { teamId } = req.query
    await Team.destroy(teamId)
    return res.status(200).send()
  }
)

export default handler
