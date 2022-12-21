# OSM Teams 🤝

## Development

Install requirements:

- [nvm](https://github.com/creationix/nvm)
- [Docker](https://www.docker.com)

Setup local authentication:

- Visit [auth.mapping.team](https://auth.mapping.team) and sign in
- Go to clients page at <https://auth.mapping.team/clients>
- Create a new app with the following settings:
  - Name: `OSM Teams Dev` (or another name of your preference)
  - Redirect URIs: `http://127.0.0.1:3000/api/auth/callback/osm-teams`
- Copy client id and secret to a newly created file named `.env.local` in the repository root, following this example:

```sh
    OSM_CONSUMER_KEY=<client-id>
    OSM_CONSUMER_SECRET=<client-secret>
```

Start development and test databases with Docker:

    docker-compose up --build

Install Node.js the required version (see [.nvmrc](.nvmrc) file):

    nvm i

Install Node.js modules:

    yarn

Migrate `dev-db` database:

    yarn migrate

Start development server:

    yarn dev

<!-- markdownlint-disable MD034 -->

✨ You can now login to the app at http://127.0.0.1:3000

<!-- markdownlint-enable MD034 -->

## Testing

Migrate `test-db` database:

    yarn migrate:test

This project uses Cypress for end-to-end testing. To run once:

    yarn e2e

To open Cypress dashboard for interactive development:

    yarn e2e:dev

By default, logging level in testing environment is set to 'silent'. Please refer to pino docs for the full [list of log levels](https://getpino.io/#/docs/api?id=level-string).

## API

The API docs can be accessed at <http://127.0.0.1:3000/docs/api>.

All API routes should include descriptions in [OpenAPI 3.0 format](https://swagger.io/specification).

Run the following command to validate the API docs:

    yarn docs:validate

## Acknowledgments

- This app is based off of [OSM/Hydra](https://github.com/kamicut/osmhydra)

## LICENSE

[MIT](LICENSE)
