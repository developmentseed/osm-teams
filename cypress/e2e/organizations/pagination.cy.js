const {
  generateSequenceArray,
  addZeroPadding,
} = require('../../../src/lib/utils')

const orgStaff = generateSequenceArray(7, 1).map((i) => ({
  id: i,
  name: `User ${addZeroPadding(i, 3)}`,
}))

const [user1, user2, user3] = orgStaff

// Organization meta
const org1 = {
  id: 1,
  name: 'My org',
  ownerId: user1.id,
}

// Generate org teams
const ORG_TEAMS_COUNT = 35
const orgTeams = generateSequenceArray(ORG_TEAMS_COUNT, 1).map((i) => ({
  id: i,
  name: `Org 1 Team ${addZeroPadding(i, 3)}`,
}))

// Keep first three org teams
const [orgTeam1, orgTeam2, orgTeam3] = orgTeams

// Generate 10 users for org team 1, from using id range starting at 100
const orgTeam1Members = generateSequenceArray(10, 100).map((i) => ({
  id: i,
  name: `User ${addZeroPadding(i, 3)}`,
}))

// Generate 20 users for org team 2, from using id range starting at 200
const orgTeam2Members = generateSequenceArray(20, 200).map((i) => ({
  id: i,
  name: `User ${addZeroPadding(i, 3)}`,
}))

// Generate 15 users for org team 3, from using id range starting at 300
const orgTeam3Members = generateSequenceArray(15, 300).map((i) => ({
  id: i,
  name: `User ${addZeroPadding(i, 3)}`,
}))

describe('Organization page', () => {
  before(() => {
    cy.task('db:reset')
    cy.task('db:seed:create-organizations', [org1])
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

  it('Organization staff table is populated and paginated', () => {
    cy.login(user1)

    // Add org staff
    cy.task('db:seed:add-organization-managers', {
      orgId: org1.id,
      managerIds: [user2.id, user3.id],
    })

    // Check state when teams are available
    cy.visit('/organizations/1')

    // Org staff table is populated
    cy.get('[data-cy=org-staff-table]').contains('User 002')
    cy.get('[data-cy=org-staff-table-pagination]').within(() => {
      cy.contains('Showing 1-3 of 3')
    })
  })

  it('Organization teams and members tables are populated and paginated', () => {
    cy.login(user1)

    // Add org teams
    cy.task('db:seed:create-organization-teams', {
      orgId: org1.id,
      teams: orgTeams,
      managerId: user1.id,
    })

    // Add members to org team 1
    cy.task('db:seed:add-members-to-team', {
      teamId: orgTeam1.id,
      members: orgTeam1Members,
    })

    // Add members to org team 2
    cy.task('db:seed:add-members-to-team', {
      teamId: orgTeam2.id,
      members: orgTeam2Members,
    })

    // Add members to org team 5
    cy.task('db:seed:add-members-to-team', {
      teamId: orgTeam3.id,
      members: orgTeam3Members,
    })

    // Check state when teams are available
    cy.visit('/organizations/1')

    /**
     * ORG TEAMS
     */
    cy.get('[data-cy=org-teams-table]').contains('Org 1 Team 010')

    // Verify index, then click on last page button
    cy.get('[data-cy=org-teams-table-pagination]').within(() => {
      cy.contains('Showing 1-10 of 35')
      cy.get('[data-cy=last-page-button]').click()
    })

    // Click page 2 button
    cy.get('[data-cy=org-teams-table-pagination]').within(() => {
      cy.get('[data-cy=page-2-button]').click()
      cy.contains('Showing 11-20 of 35')
    })

    // Item from page 2 is present
    cy.get('[data-cy=org-teams-table]').contains('Org 1 Team 012')

    // Click next page button
    cy.get('[data-cy=org-teams-table-pagination]').within(() => {
      cy.get('[data-cy=next-page-button]').click()
    })

    // Item from page 3 is present
    cy.get('[data-cy=org-teams-table]').contains('Org 1 Team 028')

    // Click previous page button
    cy.get('[data-cy=org-teams-table-pagination]').within(() => {
      cy.get('[data-cy=previous-page-button]').click()
    })

    // Item from page 2 is present
    cy.get('[data-cy=org-teams-table]').contains('Org 1 Team 015')

    /**
     * ORG TEAM MEMBERS
     */
    cy.get('[data-cy=org-members-table]').should('exist')

    // Click last page button
    cy.get('[data-cy=org-members-table-pagination]').within(() => {
      cy.contains('Showing 1-10 of 46')
      cy.get('[data-cy=last-page-button]').click()
    })

    // Last item is present
    cy.get('[data-cy=org-members-table]').contains('User 314')

    // Click page 2 button
    cy.get('[data-cy=org-members-table-pagination]').within(() => {
      cy.get('[data-cy=page-2-button]').click()
    })

    // Item from page 2 is present
    cy.get('[data-cy=org-members-table]').contains('User 203')

    // Click next page button
    cy.get('[data-cy=org-members-table-pagination]').within(() => {
      cy.contains('Showing 11-20 of 46')
      cy.get('[data-cy=next-page-button]').click()
    })

    // On page 3, click previous page button
    cy.get('[data-cy=org-members-table-pagination]').within(() => {
      cy.contains('Showing 21-30 of 46')
      cy.get('[data-cy=previous-page-button]').click()
    })

    // Item from page 2 is present
    cy.get('[data-cy=org-members-table]').contains('User 207')
  })
})
