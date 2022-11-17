describe('Profile page', () => {
  const user = {
    id: 1,
    display_name: 'User 1',
  }

  it('Can load when logged in', () => {
    cy.login(user)
    cy.visit('/profile')
  })
})
