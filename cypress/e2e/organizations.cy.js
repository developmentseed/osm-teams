const { generateSequenceArray } = require('../../src/lib/utils')

const user1 = {
  id: 1,
  display_name: 'User 1',
}

const org1 = {
  id: 1,
  name: 'My org',
  ownerId: user1.id,
}

const ORG_TEAMS_COUNT = 35

const teams = generateSequenceArray(ORG_TEAMS_COUNT, 1).map((i) => ({
  id: i,
  name: `Team ${i}`,
}))

describe('Organization page', () => {
  before(() => {
    cy.task('db:reset')
    cy.task('db:seed:organizations', [org1])
  })

  it('Display message when organization has no teams', () => {
    cy.login(user1)

    // Check state when no teams are available
    cy.visit('/organizations/1')
    cy.get('body').should('contain', 'This organization has no teams.')
  })

  it('Display list of teams', () => {
    cy.login(user1)

    // Seed org teams
    cy.task('db:seed:organization-teams', {
      orgId: org1.id,
      teams,
      managerId: user1.id,
    })

    // Check state when teams are available
    cy.visit('/organizations/1')
    cy.get('body').should('contain', teams[0].name)
  })
})
