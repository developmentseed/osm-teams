import nc from 'next-connect'
import logger from '../lib/logger'
import { unstable_getServerSession } from 'next-auth/next'
import { authOptions } from '../pages/api/auth/[...nextauth]'

const baseHandler = nc({
  attachParams: true,
  onError: (err, req, res) => {
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
baseHandler.use(async (req, res, next) => {
  req.session = await unstable_getServerSession(req, res, authOptions)
  next()
})

export default baseHandler
