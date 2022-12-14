import nc from 'next-connect'
import logger from '../lib/logger'
import { unstable_getServerSession } from 'next-auth/next'
import { authOptions } from '../pages/api/auth/[...nextauth]'

/**
 * This file contains the base handler to be used in all API routes.
 *
 * It should catch any error occurred in the route handlers and return
 * error responses consistently with Boom. The routes handlers should avoid
 * using try..catch blocks and let the errors to be handled here.
 *
 * It should also add the session to the request so the handlers can access
 * the requesting user metadata.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ResponseError:
 *       properties:
 *         statusCode:
 *           type: integer
 *         error:
 *           type: string
 *         message:
 *           type: string
 */

export function createBaseHandler() {
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

  return baseHandler
}
