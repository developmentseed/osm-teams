const { isModerator } = require('../../lib/team')

module.exports = async function ({ user_id }, { params: { id } }) {
  return isModerator(id, user_id)
}
