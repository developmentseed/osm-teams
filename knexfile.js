const { loadEnvConfig } = require('@next/env')

// Load configuration from env files using Next.js
const projectDir = process.cwd()
loadEnvConfig(projectDir)

// Get database connection
const DATABASE_URL = process.env.DATABASE_URL

module.exports = {
  test: {
    client: 'postgresql',
    connection: DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
  development: {
    client: 'postgresql',
    connection: DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
  staging: {
    client: 'postgresql',
    connection: DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: 'postgresql',
    connection: DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
}
