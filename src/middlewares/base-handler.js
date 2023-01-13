import nc from 'next-connect'
import logger from '../lib/logger'
import { getToken } from 'next-auth/jwt'

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
 *           example: 401
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

      // Handle Yup validation errors
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          statusCode: 400,
          error: 'Validation Error',
          message: err.message,
        })
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
    const token = await getToken({ req })
    if (token) {
      req.session = { user_id: token.userId || token.sub }
    }
    next()
  })

  return baseHandler
}
