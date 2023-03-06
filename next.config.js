const vercelUrl =
  process.env.NEXT_PUBLIC_VERCEL_URL &&
  `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`

module.exports = {
  async headers() {
    return [
      {
        // matching all API routes
        // link: https://vercel.com/guides/how-to-enable-cors#enabling-cors-in-a-next.js-app
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: '*',
          },
        ],
      },
    ]
  },
  env: {
    DEFAULT_PAGE_SIZE: 10,
    basePath: process.env.BASE_PATH || '',
    OSM_API:
      process.env.OSM_API ||
      process.env.OSM_DOMAIN ||
      'https://www.openstreetmap.org',
    OSM_DOMAIN: process.env.OSM_DOMAIN || 'https://www.openstreetmap.org',
    APP_URL: process.env.APP_URL || vercelUrl || 'http://127.0.0.1:3000',
    OSM_NAME: process.env.OSM_NAME || 'OSM',
    BASE_PATH: process.env.BASE_PATH || '',
    HYDRA_URL: process.env.HYDRA_URL || 'https://auth.mapping.team/hyauth',
    AUTH_URL: process.env.AUTH_URL || 'https://auth.mapping.team',
    OSMCHA_URL: process.env.OSMCH_URL || 'https://osmcha.org',
    SCOREBOARD_URL: process.env.SCOREBOARD_URL || '',
    HDYC_URL: process.env.HDYC_URL || 'https://hdyc.neis-one.org',
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
