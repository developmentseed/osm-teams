import { createBaseHandler } from '../../../../middlewares/base-handler'
import { validate } from '../../../../middlewares/validation'
import Organization from '../../../../models/organization'
import Team from '../../../../models/team'
import Boom from '@hapi/boom'
import * as Yup from 'yup'
import canCreateOrgTeam from '../../../../middlewares/can/create-org-team'
import canViewOrgTeams from '../../../../middlewares/can/view-org-teams'

const handler = createBaseHandler()

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
    query: Yup.object({
      orgId: Yup.number().required().positive().integer(),
    }).required(),
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
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *                 data:
 *                   $ref: '#/components/schemas/ArrayOfTeams'
 */
handler.get(
  canViewOrgTeams,
  validate({
    query: Yup.object({
      orgId: Yup.number().required().positive().integer(),
      page: Yup.number().min(0).integer(),
      perPage: Yup.number().min(1).max(100).integer(),
      search: Yup.string(),
      sort: Yup.mixed().oneOf(['name', 'members']),
      order: Yup.mixed().oneOf(['asc', 'desc']),
    }).required(),
  }),
  async function (req, res) {
    const { orgId, page, perPage, search, sort, order, bbox } = req.query
    const {
      org: { isMember, isOwner, isManager },
    } = req

    let bounds = bbox || null
    if (bbox) {
      bounds = bbox.split(',').map((num) => parseFloat(num))
      if (bounds.length !== 4) {
        throw Boom.badRequest('error in bbox param')
      }
    }

    return res.send(
      await Team.paginatedList({
        organizationId: orgId,
        page,
        perPage,
        bbox: bounds,
        search,
        sort,
        order,
        includePrivate: isMember || isManager || isOwner,
      })
    )
  }
)

export default handler
