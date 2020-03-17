# osm-teams 🤝

Check the beta 👉 <!-- markdownlint-disable MD034 -->https://mapping.team
<!-- markdownlint-enable MD034 -->

## Installation

### Requirements

- Postgresql. On macOS, the easiest is to install [Postgres.app](https://postgresapp.com/).
- NodeJS v12.16+
- Docker & Docker Compose

### Setting up Hydra

1. Create the database for tokens

    ```bash
    createdb osm-teams
    ```

    For the rest of this documentation, we will assume that the database location is `postgres://postgres@localhost/osm-teams?sslmode=disable` on your local machine. Inside docker, that location is `postgres://postgres@host.docker.internal/osm-teams?sslmode=disable`

1. Create a a `.env` file by copying `.env.sample` and replacing the values as needed. `OSM_CONSUMER_KEY` and `OSM_CONSUMER_SECRET` are values obtained by creating a new OAuth app on openstreetmap.org. The .env file can contain:

    ```bash
    OSM_CONSUMER_KEY=<osm-teams-app>
    OSM_CONSUMER_SECRET=<osm-teams-app-secret>
    DSN=postgres://postgres@host.docker.internal/osm-teams?sslmode=disable
    SECRETS_SYSTEM=<random-guid>
    ```

1. Install Javascript dependencies

    ```bash
    yarn install
    yarn run migrate
    ```

1. Migrate the database

    ```bash
    docker-compose run --rm hydra migrate sql --yes postgres://postgres@host.docker.internal/osm-teams?sslmode=disable
    ```

1. Build the images:

    ```bash
    docker-compose build
    ```

1. Start Hydra and the server

    ```bash
    docker-compose -f docker-compose.dev.yml up
    ```

⚠️ In development, `docker-compose -f docker-compose.dev.yml up` enables hot module reloading while you make modifications to the code. `docker-compose up` should be used for production/staging deployments.

This will start hydra where the token issuer is at `http://localhost:4444` and the admin interface is at `http://localhost:4445`. This also sets up the consent and login interface at `http://localhost:8989` (where we will create a first-party oauth app)

### Setting up the first party app

Create the first party "manage" app

```bash
docker-compose exec hydra hydra clients create --endpoint http://localhost:4445 \
  --id manage \
  --secret manage-secret \
  --response-types code,id_token \
  --grant-types refresh_token,authorization_code \
  --scope openid,offline,clients \
  --callbacks http://localhost:8989/login/accept
```

<!-- markdownlint-disable MD034 -->
✨ You can now login to the app at http://localhost:8989
<!-- markdownlint-enable MD034 -->

## Acknowledgments

- This app is based off of [OSM/Hydra](https://github.com/kamicut/osmhydra)
