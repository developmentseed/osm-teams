const { generateSequenceArray } = require('../../src/lib/utils')

const user1 = {
  id: 1,
  display_name: 'User 1',
}

const user2 = {
  id: 2,
  display_name: 'User 2',
}

const user3 = {
  id: 3,
  display_name: 'User 3',
}

/**
 * Generate 3 sets of teams, one for each user as moderator
 */
const TEAMS_COUNT = 25
const user1teams = generateSequenceArray(TEAMS_COUNT).map((i) => ({
  id: i,
  name: `Team ${i}`,
}))
const user2teams = generateSequenceArray(TEAMS_COUNT, TEAMS_COUNT).map((i) => ({
  id: i,
  name: `Team ${i}`,
}))
const user3teams = generateSequenceArray(TEAMS_COUNT, 2 * TEAMS_COUNT).map(
  (i) => ({
    id: i,
    name: `Team ${i}`,
  })
)

describe('Profile page', () => {
  before(() => {
    cy.task('db:reset')
  })

  it('Display message when user has no teams', () => {
    cy.login(user1)

    // Check state when no teams are available
    cy.visit('/profile')
    cy.get('[data-cy=my-teams-table]').contains(
      'You are not part of a team yet.'
    )
    cy.get('[data-cy=my-teams-table-pagination]').should('not.exist')
  })

  it.only('Teams list is paginated', () => {
    // Add teams with user1 as creator
    cy.task('db:seed:teams', { teams: user1teams, moderatorId: user1.id })

    // Add teams with user2 and make user1 member
    cy.task('db:seed:teams', { teams: user2teams, moderatorId: user2.id })
    cy.task('db:seed:add-team-member', {
      teams: user2teams,
      memberId: user1.id,
    })

    // Add teams with user3 with no relation with user 1
    cy.task('db:seed:teams', { teams: user3teams, moderatorId: user3.id })

    // Log in and visit profile
    cy.login(user1)
    cy.visit('/profile')

    // Check page and total count
    cy.get('[data-cy=my-teams-table-pagination]').contains('Showing 1-10 of 50')

    // Click last page button
    cy.get('[data-cy=my-teams-table-pagination]').within(() => {
      cy.get('[data-cy=last-page-button]').click()
    })

    // Last item is present
    cy.get('[data-cy=my-teams-table]').contains('Team 9')

    // Click page 2 button
    cy.get('[data-cy=my-teams-table-pagination]').within(() => {
      cy.get('[data-cy=page-2-button]').click()
    })

    // Item from page 2 is present
    cy.get('[data-cy=my-teams-table]').contains('Team 2')

    // Click next page button
    cy.get('[data-cy=my-teams-table-pagination]').within(() => {
      cy.get('[data-cy=next-page-button]').click()
    })

    // // Item from page 3 is present
    // cy.get('[data-cy=my-teams-table]').contains('Team 3')

    // // Click previous page button
    // cy.get('[data-cy=my-teams-table-pagination]').within(() => {
    //   cy.get('[data-cy=previous-page-button]').click()
    // })

    // // Item from page 2 is present
    // cy.get('[data-cy=my-teams-table]').contains('Team 2')
  })
})
