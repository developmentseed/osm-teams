describe('Check public routes', () => {
  it(`Route / is public`, () => {
    cy.visit('/')
    cy.get('body').should('contain', 'Create teams')
  })

  it(`Route /teams is public`, () => {
    cy.visit('/teams')
    cy.get('body').should('contain', 'Filter teams using map bounds')
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
    '/teams/1',
    '/teams/1/edit-profiles',
    '/teams/1/edit',
    '/teams/1/profile',
    '/teams/create',
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
