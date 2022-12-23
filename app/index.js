// Set server timezone to UTC to avoid issues with date parsing
process.env.TZ = 'UTC'

const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const boom = require('express-boom')
const next = require('next')
const cors = require('cors')

const manageRouter = require('./manage')
const oauthRouter = require('./oauth')
const logger = require('../src/lib/logger')

const dev = process.env.NODE_ENV !== 'production'
const PORT = process.env.PORT || 8989

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
async function init() {
  await nextApp.prepare()

  // On maintenance mode, render maintenance page
  if (process.env.MAINTENANCE_MODE === 'true') {
    app.get('/*', (req, res) => {
      return nextApp.render(req, res, '/maintenance')
    })
    return app
  }

  /**
   * Sub apps init
   */
  app.use('/', cors(), manageRouter(nextApp))
  app.use('/oauth', oauthRouter(nextApp))

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
  app.use(function (err, req, res) {
    if (err.message === 'Forbidden') {
      return nextApp.render(req, res, '/uh-oh')
    }
    res.status(err.status || 500)
    logger.error('error', err)
    res.boom.internal('An internal error occurred.')
  })

  return app
}

/* script run */
if (require.main === module) {
  init().then((app) => {
    app.listen(PORT, () => {
      logger.info(`Starting server on port ${PORT}`)
    })
  })
}

module.exports = init
