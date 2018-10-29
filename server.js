const server = require('./index')()
const port = parseInt(process.env.PORT, 10) || 3000

server.listen(port, (err) => {
  if (err) throw err
  console.log(`> Ready on http://localhost:${port}`)
})
