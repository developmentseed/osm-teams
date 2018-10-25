let DATABASE_URL

if (process.env.DATABASE_URL) {
  DATABASE_URL = process.env.DATABASE_URL
} else {
  if (process.env.NODE_ENV === 'test') {
    DATABASE_URL = 'postgres://osm_teams:test@localhost:5434/osm_teams'
  } else if (process.env.NODE_ENV === 'development') {
    DATABASE_URL = 'postgres://osm_teams_test:test@localhost:5434/osm_teams_test'
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
