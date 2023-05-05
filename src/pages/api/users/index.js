var fetch = require('node-fetch')
const join = require('url-join')
import * as Yup from 'yup'

import Users from '../../../models/users'
import { createBaseHandler } from '../../../middlewares/base-handler'
import { validate } from '../../../middlewares/validation'
import isAuthenticated from '../../../middlewares/can/authenticated'

const handler = createBaseHandler()

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get OSM users by username
 *     tags:
 *       - users
 *     responses:
 *       200:
 *         description: A list of OSM users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   $ref: '#/components/schemas/TeamMemberList'
 */
handler.get(
  isAuthenticated,
  validate({
    query: Yup.object({
      search: Yup.string().required(),
    }).required(),
  }),
  async function getUsers(req, res) {
    const { search } = req.query
    let users = await Users.list({ username: search })

    if (!users.length) {
      const resp = await fetch(
        join(
          process.env.OSM_API,
          `/api/0.6/changesets.json?display_name=${search}`
        )
      )
      if ([200, 304].includes(resp.status)) {
        const data = await resp.json()
        if (data.changesets) {
          const changeset = data.changesets[0]
          users = [
            {
              id: changeset.uid,
              name: changeset.user,
            },
          ]
        }
      }
    }

    let responseObject = Object.assign({}, { users })

    return res.send(responseObject)
  }
)

export default handler
