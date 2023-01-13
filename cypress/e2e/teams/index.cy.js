const {
  generateSequenceArray,
  addZeroPadding,
} = require('../../../src/lib/utils')

// Moderator user
const user1 = {
  id: 1,
}

// Generate teams
const TEAMS_COUNT = 35
const teams = generateSequenceArray(TEAMS_COUNT, 1).map((i) => ({
  id: i,
  name: `Team ${addZeroPadding(i, 3)}`,
}))

describe('Teams page', () => {
  before(() => {
    cy.task('db:reset')
    cy.task('db:seed:create-teams', {
      teams,
      moderatorId: user1.id,
    })
  })

  it('Teams index is public and list teams', () => {
    cy.visit('/teams')

    cy.get('body').should('contain', 'Team 001')
    cy.get("[data-cy='teams-table-pagination']").should('exist')
    cy.get('[data-cy=teams-table-pagination]').contains('Showing 1-10 of 35')

    // Sort by team name
    cy.get('[data-cy=teams-table-head-column-name]').click()
    cy.get('[data-cy=teams-table]')
      .find('tbody tr:nth-child(1) td:nth-child(2)')
      .contains('Team 035')
    cy.get('[data-cy=teams-table]')
      .find('tbody tr:nth-child(10) td:nth-child(2)')
      .contains('Team 026')

    // Search by team name
    cy.get('[data-cy=teams-table-search-input]').type('02')
    cy.get('[data-cy=teams-table-search-submit]').click()
    cy.get('[data-cy=teams-table]')
      .find('tbody tr:nth-child(5) td:nth-child(2)')
      .contains('Team 025')
    cy.get('[data-cy=teams-table-pagination]').contains('Showing 1-10 of 11')
  })
})
