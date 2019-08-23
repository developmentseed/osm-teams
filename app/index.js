const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const boom = require('express-boom')
const next = require('next')
const YAML = require('yamljs')
const swaggerUi = require('swagger-ui-express')
const cors = require('cors')

const manageRouter = require('./manage')
const oauthRouter = require('./oauth')

const dev = process.env.NODE_ENV !== 'production'
const PORT = process.env.PORT || 8989

const swaggerDocument = YAML.load(path.join(__dirname, '..', '/docs/api.yml'))

const nextApp = next({ dev })
const app = express()

/**
 * Middleware
 */
app.use(bodyParser.json())
app.use(compression())
app.use(boom())

/**
 * Initialize subapps after nextJS initializes
 */
async function init () {
  await nextApp.prepare()

  /**
   * Sub apps init
   */
  app.use('/', cors(), manageRouter(nextApp))
  app.use('/oauth', oauthRouter(nextApp))

  /**
   * Docs endpoints
   */
  app.use(['/api', '/api/docs'], swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  /**
   * Handle all other route GET with nextjs
   */
  const handle = nextApp.getRequestHandler()
  app.get('*', (req, res) => {
    return handle(req, res)
  })

  /**
   * Error handler
   */
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    console.error('error', err)
    res.boom.internal('An internal error occurred.')
  })

  return app
}

/* script run */
if (require.main === module) {
  init().then(app => {
    app.listen(PORT, () => {
      console.log(`Starting server on port ${PORT}`)
    })
  })
}

module.exports = init
