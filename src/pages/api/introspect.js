const { decode } = require('next-auth/jwt')
/**
 * !! This function is only used for testing
 * purposes, it mocks the hydra access token introspection
 */
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Process a POST request
    const { token } = req.body
    const decodedToken = await decode({
      token,
      secret: process.env.NEXT_AUTH_SECRET,
    })

    const result = {
      active: true,
      sub: decodedToken.userId,
    }

    res.status(200).json(result)
  } else {
    res.status(400)
  }
}
