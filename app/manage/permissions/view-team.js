/**
 * team:view
 *
 * This covers team metadata, this should always be available
 * to any users. Permission for individual pieces of metadata are controlled within
 * the route code.
 *
 * @returns {boolean} can the request go through?
 */
async function viewTeam () {
  return true
}

module.exports = viewTeam
