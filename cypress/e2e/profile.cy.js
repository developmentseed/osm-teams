describe('Profile page', () => {
  const user = {
    id: 1,
    display_name: 'User 1',
  }

  it('Redirect to sign in when not logged in', () => {
    cy.visit('/profile')
    cy.get('body').should('contain', 'Sign in')
  })

  it('Can load when logged in', () => {
    cy.login(user)
    cy.visit('/profile')
    cy.get('body').should('not.contain', 'Sign in')
  })
})
