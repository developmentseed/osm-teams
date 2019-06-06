require('dotenv').config()

const path = require('path')
const Dotenv = require('dotenv-webpack')

module.exports = {
  assetPrefix: process.env.APP_URL || 'http://localhost:8989',
  serverRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    OSM_DOMAIN: process.env.OSM_DOMAIN || 'https://www.openstreetmap.org', 
    OSM_API: process.env.OSM_API || process.env.OSM_DOMAIN || 'https://www.openstreetmap.org',
    OSM_HYDRA_ID: process.env.OSM_HYDRA_ID || 'manage',
    OSM_HYDRA_SECRET: process.env.OSM_HYDRA_SECRET || 'manage-secret',
    OSM_CONSUMER_KEY: process.env.OSM_CONSUMER_KEY,
    OSM_CONSUMER_SECRET: process.env.OSM_CONSUMER_SECRET,
    HYDRA_TOKEN_HOST: process.env.HYDRA_TOKEN_HOST || 'http://localhost:4444',
    HYDRA_TOKEN_PATH: process.env.HYDRA_TOKEN_PATH || '/oauth2/token',
    HYDRA_AUTHZ_HOST: process.env.HYDRA_AUTHZ_HOST || 'http://localhost:4444',
    HYDRA_AUTHZ_PATH: process.env.HYDRA_AUTHZ_PATH || '/oauth2/auth',
    HYDRA_ADMIN_HOST: process.env.HYDRA_ADMIN_HOST || 'http://localhost:4445'
  },
  publicRuntimeConfig: {
    APP_URL: process.env.APP_URL || 'http://localhost:8989'
  },
  onDemandEntries: {
    websocketPort: 3007
  },
  webpack: (config) => {
    config.plugins = config.plugins || []

    config.plugins = [
      ...config.plugins,

      // Read the .env file
      new Dotenv({
        path: path.join(__dirname, '.env'),
        systemvars: true
      })
    ]

    return config
  }
}
