/**
 * Routes to create a user's places
 */
const db = require('../db')

async function getPlaces (req, res) {
  let conn = await db()
  const uid = res.locals.user_id

  if (!uid) {
    return res.boom.unauthorized('Could not authenticate user')
  }

  try {
    const places = await conn('places').select(['center', 'id']).where('user', uid)
    res.send({ places })
  } catch (e) {
    req.log.error(e)
    res.sendStatus(500)
  }
}

async function createPlace (req, res) {
  let center = req.body.center
  const uid = res.locals.user_id

  if (!uid) {
    return res.boom.unauthorized('Could not authenticate user')
  }

  let conn = await db()
  try {
    await conn('places').insert({ 'user': uid, center: JSON.stringify(center)})
    res.sendStatus(200)
  } catch (e) {
    req.log.error(e)
    res.sendStatus(500)
  }
}

async function deletePlace (req, res) {
  let placeID = req.params.id
  const uid = res.locals.user_id

  if (!uid) {
    return res.boom.unauthorized('Could not authenticate user')
  }

  let conn = await db()
  try {
    await conn('places').where({ 'id': placeID }).del()
    res.sendStatus(200)
  } catch (e) {
    req.log.error(e)
    res.sendStatus(500)
  }
}

module.exports = {
  getPlaces,
  createPlace,
  deletePlace
}