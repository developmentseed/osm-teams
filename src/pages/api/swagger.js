import { withSwagger } from 'next-swagger-doc'
import nextSwaggerDocSpec from '../../../next-swagger-doc.json'

/**
 * @swagger
 * /api/swagger:
 *   get:
 *     description: Get Swagger file as JSON
 *     responses:
 *       200:
 *         description: API description as Swagger JSON file
 */
const swaggerHandler = withSwagger(nextSwaggerDocSpec)
export default swaggerHandler()
