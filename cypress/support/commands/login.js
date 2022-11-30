import hkdf from '@panva/hkdf'
import { EncryptJWT } from 'jose'

/**
 * The login command creates a valid session from a user object. This is based
 * on the approach proposed here:
 * https://github.com/nextauthjs/next-auth/discussions/2053#discussioncomment-2225544
 */

// Function logic derived from https://github.com/nextauthjs/next-auth/blob/5c1826a8d1f8d8c2d26959d12375704b0a693bfc/packages/next-auth/src/jwt/index.ts#L113-L121
async function getDerivedEncryptionKey(secret) {
  return await hkdf(
    'sha256',
    secret,
    '',
    'NextAuth.js Generated Encryption Key',
    32
  )
}

// Function logic derived from https://github.com/nextauthjs/next-auth/blob/5c1826a8d1f8d8c2d26959d12375704b0a693bfc/packages/next-auth/src/jwt/index.ts#L16-L25
export async function encode(token, secret) {
  const maxAge = 30 * 24 * 60 * 60 // 30 days
  const encryptionSecret = await getDerivedEncryptionKey(secret)
  return await new EncryptJWT(token)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(Math.round(Date.now() / 1000 + maxAge))
    .setJti('test')
    .encrypt(encryptionSecret)
}

Cypress.Commands.add('login', (userObj) => {
  // Generate and set a valid cookie from the fixture that next-auth can decrypt
  cy.wrap(null)
    .then(() => {
      return encode(
        { ...userObj, sub: userObj.id },
        Cypress.env('NEXTAUTH_SECRET')
      )
    })
    .then((encryptedToken) =>
      cy.setCookie('next-auth.session-token', encryptedToken)
    )
})
