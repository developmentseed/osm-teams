import Pino from 'pino'

/**
 * Create logger instance. Level is set to 'silent' when testing.
 */
const logger = Pino({
  prettyPrint: true,
  level: process.env.TESTING ? 'silent' : 'info',
})

export default logger
