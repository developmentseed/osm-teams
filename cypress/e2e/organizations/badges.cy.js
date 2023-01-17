const {
  generateSequenceArray,
  addZeroPadding,
} = require('../../../src/lib/utils')

// Generate org member
const org1Members = generateSequenceArray(30, 1).map((i) => ({
  id: i,
  name: `User ${addZeroPadding(i, 3)}`,
}))

const [user1, ...org1Team1Members] = org1Members

// Organization meta
const org1 = {
  id: 1,
  name: 'Org 1',
  ownerId: user1.id,
}

const org1Team1 = {
  id: 1,
  name: 'Org 1 Team 1',
}

const BADGES_COUNT = 30

const org1Badges = generateSequenceArray(BADGES_COUNT, 1).map((i) => ({
  id: i,
  name: `Badge ${addZeroPadding(i, 3)}`,
  color: `rgba(255,0,0,${i / BADGES_COUNT})`,
}))

const [org1Badge1, org1Badge2, org1Badge3] = org1Badges

describe('Organization page', () => {
  before(() => {
    cy.task('db:reset')

    // Create organization
    cy.task('db:seed:create-organizations', [org1])

    // Add org teams
    cy.task('db:seed:create-organization-teams', {
      orgId: org1.id,
      teams: [org1Team1],
      managerId: user1.id,
    })

    // Add members to org team 1
    cy.task('db:seed:add-members-to-team', {
      teamId: org1Team1.id,
      members: org1Team1Members,
    })

    // Create org badges
    cy.task('db:seed:create-organization-badges', {
      orgId: org1.id,
      badges: org1Badges,
    })

    // Assign badge 1 to the first five users
    cy.task('db:seed:assign-badge-to-users', {
      badgeId: org1Badge1.id,
      users: org1Team1Members.slice(0, 4),
    })

    // Assign badge 2 to five users, starting at user 3
    cy.task('db:seed:assign-badge-to-users', {
      badgeId: org1Badge2.id,
      users: org1Team1Members.slice(2, 7),
    })

    // Assign badge 3 to five users, starting at user 5
    cy.task('db:seed:assign-badge-to-users', {
      badgeId: org1Badge3.id,
      users: org1Team1Members.slice(4, 9),
    })
  })

  it('Organization members table display badges', () => {
    cy.login(user1)

    cy.visit('/organizations/1')

    cy.get('[data-cy=org-members-table]')
      .find('tbody tr:nth-child(6) td:nth-child(3)')
      .contains('Badge 002')
    cy.get('[data-cy=org-members-table]')
      .find('tbody tr:nth-child(6) td:nth-child(3)')
      .contains('Badge 003')
    cy.get('[data-cy=org-members-table]')
      .find('tbody tr:nth-child(10) td:nth-child(3)')
      .contains('Badge 003')
  })
})
