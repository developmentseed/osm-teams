import Pino from 'pino'

/**
 * Create logger instance. Level is set to 'silent' when testing.
 */
const logger = Pino({
  prettyPrint: true,
  level: process.env.LOG_LEVEL || 'info',
})

export default logger
