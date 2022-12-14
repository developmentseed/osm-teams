import packageJson from '../../../package.json'
import manageRouter from '../../../app/manage'
import { createBaseHandler } from '../../middlewares/base-handler'

/**
 * This is a catch all handler for the API routes from v1 that weren't
 * migrated to the /src/page/api folder. The v1 routes are located in
 * /app/manage folder and should be migrated to v2 approach when possible.
 */

const handler = createBaseHandler()

handler.get('api/', (_, res) => {
  res.status(200).json({ version: packageJson.version })
})

manageRouter(handler)

export default handler
