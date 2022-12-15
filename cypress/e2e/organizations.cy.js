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
    cy.get('[data-cy=org-teams-table]').contains(
      'This organization has no teams'
    )
    cy.get('[data-cy=org-teams-table-pagination]').should('not.exist')
  })

  it('Display paginated list of teams', () => {
    cy.login(user1)

    // Seed org teams
    cy.task('db:seed:organization-teams', {
      orgId: org1.id,
      teams,
      managerId: user1.id,
    })

    // Check state when teams are available
    cy.visit('/organizations/1')

    cy.get('[data-cy=org-teams-table]').contains('Team 10')

    // Click last page button
    cy.get('[data-cy=org-teams-table-pagination]').within(() => {
      cy.get('[data-cy=last-page-button]').click()
    })

    // Last item is present
    cy.get('[data-cy=org-teams-table]').contains('Team 9')

    // Click page 2 button
    cy.get('[data-cy=org-teams-table-pagination]').within(() => {
      cy.get('[data-cy=page-2-button]').click()
    })

    // Item from page 2 is present
    cy.get('[data-cy=org-teams-table]').contains('Team 2')

    // Click next page button
    cy.get('[data-cy=org-teams-table-pagination]').within(() => {
      cy.get('[data-cy=next-page-button]').click()
    })

    // Item from page 3 is present
    cy.get('[data-cy=org-teams-table]').contains('Team 3')

    // Click previous page button
    cy.get('[data-cy=org-teams-table-pagination]').within(() => {
      cy.get('[data-cy=previous-page-button]').click()
    })

    // Item from page 2 is present
    cy.get('[data-cy=org-teams-table]').contains('Team 2')
  })
})
