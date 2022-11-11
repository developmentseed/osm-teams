import packageJson from '../../../package.json'
import nc from 'next-connect'
import manageRouter from '../../../app/manage'
import logger from '../../lib/logger'
import { unstable_getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

let handler = nc({
  attachParams: true,
  onError: (err, req, res, next) => {
    logger.error(err)
    // Handle Boom errors
    if (err.isBoom) {
      const { statusCode, payload } = err.output
      return res.status(statusCode).json(payload)
    }

    // Generic error
    return res.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An internal server error occurred',
    })
  },
  onNoMatch: (req, res) => {
    res.status(404).json({
      statusCode: 404,
      error: 'Not Found',
      message: 'missing',
    })
  },
})

// Add session to request
handler.use(async (req, res, next) => {
  req.session = await unstable_getServerSession(req, res, authOptions)
  next()
})

handler.get('api/', (req, res) => {
  res.status(200).json({ version: packageJson.version })
})

manageRouter(handler)

export default handler
