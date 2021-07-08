const { head, has } = require('ramda')

async function unpack (promise) {
  return promise.then(head)
}

class ValidationError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ValidationError'
  }
}
class PropertyRequiredError extends ValidationError {
  constructor (property) {
    super('No property: ' + property)
    this.name = 'PropertyRequiredError'
    this.property = property
  }
}

/**
 * @param {string[]} requiredProperties required keys in an object
 * @param {Object} object object to check
 */
function checkRequiredProperties (requiredProperties, object) {
  requiredProperties.forEach(key => {
    if (!has(key)(object)) {
      throw new PropertyRequiredError(key)
    }
  })
}

module.exports = {
  unpack,
  ValidationError,
  PropertyRequiredError,
  checkRequiredProperties
}
