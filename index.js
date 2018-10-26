const path = require('path')

const fastify = require('fastify')
const fastifySwagger = require('fastify-swagger')
const fastifyBoom = require('fastify-boom')

const Next = require('next')

const api = require('./api')

module.exports = function createServer () {
  const server = fastify({ logger: { level: 'error' } })
  const dev = process.env.NODE_ENV !== 'production'

  server.register((fastify, opts, next) => {
    const app = Next({ dev })

    app.prepare()
      .then(() => {
        if (dev) {
          server.get('/_next/*', (req, reply) => {
            return app.handleRequest(req.req, reply.res)
              .then(() => {
                reply.sent = true
              })
          })
        }

        server.get('/api/teams', api.teams.list)
        server.post('/api/teams', api.teams.create)
        server.get('/api/teams/:id', api.teams.get)
        server.put('/api/teams/:id', api.teams.update)
        server.delete('/api/teams/:id', api.teams.destroy)

        server.get('/*', (req, reply) => {
          return app.handleRequest(req.req, reply.res)
            .then(() => {
              reply.sent = true
            })
        })

        server.setNotFoundHandler((request, reply) => {
          return app.render404(request.req, reply.res)
            .then(() => {
              reply.sent = true
            })
        })

        next()
      })
      .catch((err) => next(err))
  })

  server.register(fastifyBoom)

  server.register(fastifySwagger, {
    routePrefix: '/api-docs',
    mode: 'static',
    exposeRoute: true,
    specification: {
      path: path.join('api', 'api.yaml')
    }
  })

  return server
}
