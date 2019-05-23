require('dotenv').config()

const path = require('path')
const Dotenv = require('dotenv-webpack')

module.exports = {
  serverRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    OSM_HYDRA_ID: process.env.OSM_HYDRA_ID || 'manage',
    OSM_HYDRA_SECRET: process.env.OSM_HYDRA_SECRET || 'manage-secret',
    OSM_CONSUMER_KEY: process.env.OSM_CONSUMER_KEY,
    OSM_CONSUMER_SECRET: process.env.OSM_CONSUMER_SECRET,
    HYDRA_TOKEN_URL: process.env.HYDRA_TOKEN_URL || 'http://localhost:4444',
    HYDRA_AUTHZ_URL: process.env.HYDRA_AUTHZ_URL || 'http://localhost:4444',
    HYDRA_ADMIN_URL: process.env.HYDRA_ADMIN_URL || 'http://localhost:4445'
  },
  publicRuntimeConfig: {
    APP_URL: process.env.APP_URL || 'http://localhost:8989'
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
