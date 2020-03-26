const { head } = require('ramda')

async function unpack (promise) {
  return promise.then(head)
}

module.exports = {
  unpack
}
