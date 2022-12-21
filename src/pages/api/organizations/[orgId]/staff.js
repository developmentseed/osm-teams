import { createBaseHandler } from '../../../../middlewares/base-handler'
import { validate } from '../../../../middlewares/validation'
import Organization from '../../../../models/organization'
import * as Yup from 'yup'
import canViewOrgMembers from '../../../../middlewares/can/view-org-members'

const handler = createBaseHandler()

/**
 * @swagger
 * /organizations/{id}/staff:
 *   get:
 *     summary: Get list of staff of an organization
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
      orgId: Yup.number().required().positive().integer().required(),
      page: Yup.number().min(0).integer(),
    }).required(),
  }),
  async function (req, res) {
    const { orgId, page } = req.query

    const staff = await Organization.getOrgStaff(orgId, {
      page,
    })

    return res.send(staff)
  }
)

export default handler
