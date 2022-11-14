import packageJson from '../../package.json'

/**
 * @swagger
 * /api:
 *   get:
 *     description: Get API version
 *     responses:
 *       200:
 *         description: API version
 */
export default function handler(req, res) {
  res.status(200).json({ version: packageJson.version })
}
