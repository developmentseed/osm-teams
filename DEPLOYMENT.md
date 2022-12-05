# Production Deployment Documentation

## Requirements

In production, you will need either a subdomain or a namespace for the hydra token issuer. Nginx, Apache or Caddyserver could be used as a reverse proxy server to capture the URL and forward to either the OSM Teams application or hydra. For this example, let's take the use case of mapping.team.

## Setting up Hydra URLs

1. Copy over `hydra-config/dev/hydra.yml` to `hydra-config/prod/hydra.yml`
2. Modify the `urls` values in `hydra.yml`

For example, for `mapping.team` we modify the urls to be the following:

```yaml
urls:
  self:
    issuer: https://mapping.team/hyauth
  consent: https://mapping.team/oauth/consent
  login: https://mapping.team/oauth/login
  logout: https://mapping.team/oauth/logout
```

This is because we set the token provider at `https://mapping.team/hyauth` and use a reverse proxy (nginx):

```nginx
	server {
       		server_name  mapping.team dev.mapping.team;
        	rewrite ^(.*\b(docs)\b.*[^/])$ $1/ redirect;

		location /hyauth/ {
          		proxy_set_header host $host;
          		proxy_pass http://127.0.0.1:4444/;
        	}

		location / {
          		proxy_set_header host $host;
          		proxy_pass http://127.0.0.1:3000/;
        	}
  }
```

3. Modify `hydra.yml` system secret and others according to the [configuration spec](https://www.ory.sh/hydra/docs/reference/configuration/)

### Env variables

Similarly to local development, we have to add `OSM_CONSUMER_KEY`, `OSM_CONSUMER_SECRET` and `DSN` to `.env`

We also have to add a few environment variables so that the tokens are issued by the proper URL:

```bash
HYDRA_ADMIN_HOST=http://hydra:4445
HYDRA_TOKEN_HOST=http://hydra:4444
HYDRA_TOKEN_PATH=/oauth2/token
HYDRA_AUTHZ_HOST=https://mapping.team
HYDRA_AUTHZ_PATH=/hyauth/oauth2/auth
```

- `HYDRA_ADMIN_HOST` and `HYDRA_TOKEN_HOST` are internal URLs accessed by docker to issue tokens, so they use the `hydra` service name.
- `HYDRA_TOKEN_PATH` uses the default internal URL for hydra tokens
- `HYDRA_AUTHZ_HOST` is the domain where the browser will initiate the authorization request
- `HYDRA_AUTHZ_PATH` is the path where the browser initiates the authorization request

Finally we should set `APP_URL` to be the new domain, for example `https://mapping.team`

If you are using a sub-path of a domain you should set the `BASE_PATH` environment variable

`.env` will now look like:

```sh
OSM_CONSUMER_KEY=<redacted>
OSM_CONSUMER_SECRET=<redacted>
APP_URL=https://mapping.team
DSN=<redacted>
BASE_PATH=/example
HYDRA_ADMIN_HOST=http://hydra:4445
HYDRA_TOKEN_HOST=http://hydra:4444
HYDRA_TOKEN_PATH=/oauth2/token
HYDRA_AUTHZ_HOST=https://mapping.team
HYDRA_AUTHZ_PATH=/hyauth/oauth2/auth
```

## Deployment

Once the environment variables, `hydra.yml` and the reverse proxy are created, we can then run:

```docker
docker-compose -f compose.yml -f compose.prod.yml up
```
