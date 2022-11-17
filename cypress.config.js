const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:3000/',
    video: false,
  },
  env: {
    NEXTAUTH_SECRET: 'next-auth-cypress-secret',
  },
})
