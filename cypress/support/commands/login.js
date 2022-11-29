const getSessionToken = require('../../../tests/utils/get-session-token')

Cypress.Commands.add('login', (userObj) => {
  // Generate and set a valid cookie from the fixture that next-auth can decrypt
  cy.wrap(null)
    .then(() => {
      return getSessionToken(
        { ...userObj, sub: userObj.id },
        Cypress.env('NEXTAUTH_SECRET')
      )
    })
    .then((encryptedToken) =>
      cy.setCookie('next-auth.session-token', encryptedToken)
    )
})
