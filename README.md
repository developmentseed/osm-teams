# OSM Teams 🤝

## Development

Install requirements:

- [nvm](https://github.com/creationix/nvm)
- [Docker](https://www.docker.com)

Visit your [OpenStreetMap settings](https://www.openstreetmap.org/account/edit) page and [register an OAuth2 app](https://www.openstreetmap.org/oauth2/applications) with the following settings:

- Name: `OSM Teams Dev` (or another name of your preference)
- Redirect URIs: `http://127.0.0.1:3000/api/auth/callback/openstreetmap`
- Confidential application: `false`
- Permissions: `Read user preferences` only

Example:

![OSM Client App](oauth2-osm-client-app.png 'OAuth 2 page at OSM Website')

Create an `.env.local` file and add environment variables `OSM_CONSUMER_KEY` and `OSM_CONSUMER_SECRET` obtained at OAuth2 page at OpenStreetMap website. The `.env.local` file should be like the following:

    OSM_CONSUMER_KEY=<osm-oauth2-client-id>
    OSM_CONSUMER_SECRET=<osm-oauth2-client-secret>

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
