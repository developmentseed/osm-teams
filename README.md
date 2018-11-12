# osm-teams

A teams API for OpenStreetMap.

[![CircleCI](https://circleci.com/gh/developmentseed/osm-teams.svg?style=svg)](https://circleci.com/gh/developmentseed/osm-teams)

# Documentation

- [API docs](docs/api.md)
- [Tests](tests/README.md)

## Development

### Requirements

- [yarn](https://yarnpkg.com/en/)
- [Docker](https://docs.docker.com/install/) & [Docker Compose](https://docs.docker.com/compose/install/) to run the database
  - alternately you can use a Postgresql database and provide the url to the database using the `DATABASE_URL` environment variable
- [An OSM Consumer Key and Secret](https://wiki.openstreetmap.org/wiki/OAuth)

### Initial setup
- `git clone` this repository
- `cd osm-teams`
- `yarn`

Copy over `.env.sample` to `.env` and fill in the OSM consumer key and secret, as well as your site location. For example in local development `API_URL` will default to `http://localhost:3000`.

#### If you're using Docker Compose
- run `docker-compose up`
  - to run docker-compose in a background process, use `docker-compose up -d`
- `yarn migrate`
- `yarn run dev`

#### If you're using a Postgresql db on your local computer
- create a database for osm-teams
  - you can use the [create-dev-db.sh](scripts/create-dev-db.sh) script as an example, or run it directly:
    `./scripts/create-dev-db.sh`
- `DATABASE_URL=postgres://osm_teams:test@127.0.0.1/osm_teams yarn migrate`
- `DATABASE_URL=postgres://osm_teams:test@localhost/osm_teams yarn run dev`

### Running tests
- `yarn test`
  - make sure to use `DATABASE_URL` if not using docker-compose
