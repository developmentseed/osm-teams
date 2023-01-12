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
  },
  basePath: process.env.BASE_PATH || '',
  env: {
    APP_URL: process.env.APP_URL || vercelUrl || 'http://127.0.0.1:3000',
    OSM_NAME: process.env.OSM_NAME || 'OSM',
    BASE_PATH: process.env.BASE_PATH || '',
    HYDRA_URL: process.env.HYDRA_URL || 'https://auth.mapping.team/hyauth',
    AUTH_URL: process.env.AUTH_URL || 'https://auth.mapping.team',
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
