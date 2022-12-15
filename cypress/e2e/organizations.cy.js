const user1 = {
  id: 1,
  display_name: 'User 1',
}

const org1 = {
  id: 1,
  name: 'My org',
  ownerId: user1.id,
}

const team1 = {
  name: 'Team 1',
}

describe('Organization page', () => {
  before(() => {
    cy.task('db:reset')
    cy.task('db:seed:organizations', [org1])
  })

  it('List organization teams', () => {
    cy.login(user1)

    // Check state when no teams are available
    cy.visit('/organizations/1')
    cy.get('body').should('contain', 'This organization has no teams.')

    // Seed org teams
    cy.task('db:seed:organization-teams', {
      orgId: org1.id,
      teams: [team1],
      managerId: user1.id,
    })

    // Check state when teams are available
    cy.visit('/organizations/1')
    cy.get('body').should('contain', team1.name)
  })
})
