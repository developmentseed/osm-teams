describe('Teams page', () => {
  before(() => {
    cy.task('db:reset')
    cy.task('db:seed')
  })

  it('Teams index is public and list teams', () => {
    cy.visit('/teams')
    cy.get('body').should('contain', 'Team 1')
    cy.get('body').should('contain', 'Team 2')
  })

  it('Do not list members on public access to private team pages', () => {
    cy.visit('/teams/1')
    cy.get('body').should('contain', 'Team Members')
    cy.visit('/teams/2')
    cy.get('body').should('not.contain', 'Team Members')
  })

  it('List members on member access to private team pages', () => {
    // Signed in team member
    cy.login({
      id: 1,
      display_name: 'User 1',
    })
    cy.visit('/teams/1')
    cy.get('body').should('contain', 'Team Members')
    cy.visit('/teams/2')
    cy.get('body').should('contain', 'Team Members')
  })

  it('Do not list members on non-member access to private team pages', () => {
    // Signed in as non-team member
    cy.login({
      id: 2,
      display_name: 'User 2',
    })
    cy.visit('/teams/1')
    cy.get('body').should('contain', 'Team Members')
    cy.visit('/teams/2')
    cy.get('body').should('not.contain', 'Team Members')
  })
})
