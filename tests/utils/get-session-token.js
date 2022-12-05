const { hkdf } = require('@panva/hkdf')
const { EncryptJWT } = require('jose')

async function getSessionToken(token, secret) {
  // Function logic derived from https://github.com/nextauthjs/next-auth/blob/5c1826a8d1f8d8c2d26959d12375704b0a693bfc/packages/next-auth/src/jwt/index.ts#L113-L121
  const encryptionSecret = await await hkdf(
    'sha256',
    secret,
    '',
    'NextAuth.js Generated Encryption Key',
    32
  )

  // Function logic derived from https://github.com/nextauthjs/next-auth/blob/5c1826a8d1f8d8c2d26959d12375704b0a693bfc/packages/next-auth/src/jwt/index.ts#L16-L25
  const maxAge = 30 * 24 * 60 * 60 // 30 days
  return await new EncryptJWT(token)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(Math.round(Date.now() / 1000 + maxAge))
    .setJti('test')
    .encrypt(encryptionSecret)
}

module.exports = getSessionToken
