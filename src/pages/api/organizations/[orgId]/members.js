import { createBaseHandler } from '../../../../middlewares/base-handler'
import { validate } from '../../../../middlewares/validation'
import Organization from '../../../../models/organization'
import Team from '../../../../models/team'
import * as Yup from 'yup'
import canViewOrgMembers from '../../../../middlewares/can/view-org-members'
import { map, prop } from 'ramda'

const handler = createBaseHandler()

/**
 * @swagger
 * /organizations/{id}/members:
 *   get:
 *     summary: Get list of members of an organization
 *     tags:
 *       - organizations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Organization id
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
  canViewOrgMembers,
  validate({
    query: Yup.object({
      orgId: Yup.number().required().positive().integer(),
      page: Yup.number().min(0).integer(),
      search: Yup.string(),
    }).required(),
  }),
  async function (req, res) {
    const { orgId, page, search } = req.query

    let members = await Organization.getMembersPaginated(orgId, {
      page,
      search,
    })

    const memberIds = map(prop('osm_id'), members)
    if (memberIds.length > 0) {
      members = await Team.resolveMemberNames(memberIds)
    }

    return res.send(members)
  }
)

export default handler
