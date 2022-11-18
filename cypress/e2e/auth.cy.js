describe('Required authentication', () => {
  const user = {
    id: 1,
    display_name: 'User 1',
  }

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
      cy.login(user)
      cy.visit(testRoute)
      cy.get('body').should('not.contain', 'Sign in')
    })
  })
})
