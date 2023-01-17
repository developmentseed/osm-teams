const db = require('../lib/db')

/**
 *
 * Assign existing badge to an user.
 *
 * @param {int} userId - User id
 * @param {int} badgeId - Badge id
 * @param {Date} assignedAt - Badge assignment date
 * @param {Date} validUntil - Badge expiration date
 * @returns
 */
async function assignUserBadge(badgeId, userId, assignedAt, validUntil) {
  const [badge] = await db('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
      assigned_at: assignedAt,
      valid_until: validUntil ? validUntil : null,
    })
    .returning('*')
  return badge
}

module.exports = {
  assignUserBadge,
}
