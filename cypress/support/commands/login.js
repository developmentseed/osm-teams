const getSessionToken = require('../../../tests/utils/get-session-token')

Cypress.Commands.add('login', (user) => {
  // Generate and set a valid cookie from the fixture that next-auth can decrypt
  cy.wrap(null)
    .then(() => {
      return getSessionToken(user, Cypress.env('NEXTAUTH_SECRET'))
    })
    .then((encryptedToken) =>
      cy.setCookie('next-auth.session-token', encryptedToken)
    )
})
