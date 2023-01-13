const Pino = require('pino')

/**
 * Create logger instance. Level is set to 'silent' when testing.
 */
const logger = Pino({
  prettyPrint: true,
  level: process.env.LOG_LEVEL || 'info',
})

module.exports = logger
