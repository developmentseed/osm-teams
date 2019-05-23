let DATABASE_URL

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

if (process.env.DSN) {
  DATABASE_URL = process.env.DSN
} else {
  if (process.env.NODE_ENV === 'development') {
    DATABASE_URL = 'postgres://postgres@localhost/osm-teams'
  } else if (process.env.NODE_ENV === 'test') {
    DATABASE_URL = 'postgres://postgres@localhost/osm-teams-test'
  }
}

module.exports = {
  test: {
    client: 'postgresql',
    connection: DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  development: {
    client: 'postgresql',
    connection: DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  staging: {
    client: 'postgresql',
    connection: DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  production: {
    client: 'postgresql',
    connection: DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}
