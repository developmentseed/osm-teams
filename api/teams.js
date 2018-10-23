function list (req, reply) {
  reply.send({ teams: [] })
}

module.exports = {
  list
}
