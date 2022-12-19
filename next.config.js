const vercelUrl =
  process.env.NEXT_PUBLIC_VERCEL_URL &&
  `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`

module.exports = {
  serverRuntimeConfig: {
    DEFAULT_PAGE_SIZE: 10,
    NODE_ENV: process.env.NODE_ENV || 'development',
    OSM_DOMAIN: process.env.OSM_DOMAIN || 'https://www.openstreetmap.org',
    OSM_API:
      process.env.OSM_API ||
      process.env.OSM_DOMAIN ||
      'https://www.openstreetmap.org',
    OSM_HYDRA_ID: process.env.OSM_HYDRA_ID || 'manage',
    OSM_HYDRA_SECRET: process.env.OSM_HYDRA_SECRET || 'manage-secret',
    OSM_CONSUMER_KEY: process.env.OSM_CONSUMER_KEY,
    OSM_CONSUMER_SECRET: process.env.OSM_CONSUMER_SECRET,
    HYDRA_TOKEN_HOST: process.env.HYDRA_TOKEN_HOST || 'http://localhost:4444',
    HYDRA_TOKEN_PATH: process.env.HYDRA_TOKEN_PATH || '/oauth2/token',
    HYDRA_AUTHZ_HOST: process.env.HYDRA_AUTHZ_HOST || 'http://localhost:4444',
    HYDRA_AUTHZ_PATH: process.env.HYDRA_AUTHZ_PATH || '/oauth2/auth',
    HYDRA_ADMIN_HOST: process.env.HYDRA_ADMIN_HOST || 'http://localhost:4445',
  },
  basePath: process.env.BASE_PATH || '',
  env: {
    APP_URL: process.env.APP_URL || vercelUrl || 'http://127.0.0.1:3000',
    OSM_NAME: process.env.OSM_NAME || 'OSM',
    BASE_PATH: process.env.BASE_PATH || '',
  },
  eslint: {
    dirs: [
      'app',
      'pages',
      'components',
      'lib',
      'tests',
      'migrations',
      'styles',
      'src',
      'cypress',
    ],
  },
}
