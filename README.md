# OSM Teams 🤝

## Development

Install requirements:

- [nvm](https://github.com/creationix/nvm)
- [Docker](https://www.docker.com)

Visit your [OpenStreetMap settings](https://www.openstreetmap.org/account/edit) page and [register an OAuth2 app](https://www.openstreetmap.org/oauth2/applications) :

![OSM Client App](oauth2-osm-client-app.png "OAuth 2 page at OSM Website")

Create an `.env.local` file and add environment variables `OSM_CONSUMER_KEY` and `OSM_CONSUMER_SECRET` obtained at OAuth2 page at OpenStreetMap website. The `.env.local` file should be like the following:

    ```bash
    OSM_CONSUMER_KEY=<osm-oauth2-client-id>
    OSM_CONSUMER_SECRET=<osm-oauth2-client-secret>
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

This project uses Cypress for end-to-end testing. To run once:

    yarn e2e

To open Cypress dashboard for interactive development:

    yarn e2e:dev

## Acknowledgments

- This app is based off of [OSM/Hydra](https://github.com/kamicut/osmhydra)

## LICENSE

[MIT](LICENSE)
