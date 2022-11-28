describe('Check public routes', () => {
  it(`Route / is public`, () => {
    cy.visit('/')
    cy.get('body').should('contain', 'Create teams')
  })
})

describe('Check protected routes', () => {
  const protectedRoutes = [
    '/clients',
    '/organizations/1',
    '/organizations/1/edit-privacy-policy',
    '/organizations/1/edit-profiles',
    '/organizations/1/edit-team-profiles',
    '/organizations/1/edit',
    '/organizations/1/profile',
    '/organizations/create',
    '/profile',
  ]

  protectedRoutes.forEach((testRoute) => {
    it(`Route ${testRoute} needs authentication`, () => {
      cy.visit(testRoute)
      cy.get('body').should('contain', 'Sign in with openstreetmap')
    })
  })

  protectedRoutes.forEach((testRoute) => {
    it(`Route ${testRoute} is displayed when authenticated`, () => {
      // Authorized visit, should redirect to sign in
      cy.login({
        id: 1,
        display_name: 'User 1',
      })
      cy.visit(testRoute)
      cy.get('body').should('not.contain', 'Sign in')
    })
  })
})
