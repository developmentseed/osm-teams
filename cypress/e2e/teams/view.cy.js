const {
  generateSequenceArray,
  addZeroPadding,
} = require('../../../src/lib/utils')

const team1Members = generateSequenceArray(25, 1).map((i) => ({
  id: i,
  name: `User ${addZeroPadding(i, 3)}`,
}))

const [user1] = team1Members

const nonMemberUser = {
  id: 999,
  name: `User 999`,
}

const team1 = {
  id: 1,
  name: 'Team 1',
  privacy: 'public',
}

const team2 = {
  id: 2,
  name: 'Team 2',
  privacy: 'private',
}

describe('Teams page', () => {
  before(() => {
    cy.task('db:reset')
    cy.task('db:seed:create-teams', {
      teams: [team1, team2],
      moderatorId: user1.id,
    })
  })

  it('Do not list members on public access to private team pages', () => {
    // Team 1 is public, should display member list
    cy.visit('/teams/1')
    cy.get('body').should('contain', 'Team 1')
    cy.get("[data-cy='team-members-section']").should('exist')

    // Team 2 is private, should NOT display member list
    cy.visit('/teams/2')
    cy.get('body').should('contain', 'Team 2')
    cy.get("[data-cy='team-members-section']").should('not.exist')
  })

  it('List members on member access to private team pages', () => {
    // Sign in as team member
    cy.login({
      id: 1,
      display_name: 'User 001',
    })

    // Team 1 is public, should display member list
    cy.visit('/teams/1')
    cy.get('body').should('contain', 'Team 1')
    cy.get("[data-cy='team-members-section']").should('exist')

    // Team 2 is private, should display member list
    cy.visit('/teams/2')
    cy.get('body').should('contain', 'Team 2')
    cy.get("[data-cy='team-members-section']").should('exist')
  })

  it('Do not list members on non-member access to private team pages', () => {
    // Signed in as non-team member
    cy.login(nonMemberUser)

    // Team 1 is public, should display member list
    cy.visit('/teams/1')
    cy.get('body').should('contain', 'Team 1')
    cy.get("[data-cy='team-members-section']").should('exist')

    // Team 2 is private, should display member list
    cy.visit('/teams/2')
    cy.get('body').should('contain', 'Team 2')
    cy.get("[data-cy='team-members-section']").should('not.exist')
  })

  it('Public team has a paginated team member table', () => {
    cy.task('db:seed:add-members-to-team', {
      teamId: team1.id,
      members: team1Members,
    })

    // Team 1 is public, should display member list
    cy.visit('/teams/1')
    cy.get('body').should('contain', 'Team 1')
    cy.get("[data-cy='team-members-section']").should('exist')
    cy.get("[data-cy='team-members-table-pagination']").should('exist')
    cy.get('[data-cy=team-members-table-pagination]').contains(
      'Showing 1-10 of 25'
    )

    // Perform sort by username
    cy.get('[data-cy=team-members-table-head-column-name]').click()
    cy.get('[data-cy=team-members-table]').contains('User 025')
    cy.get('[data-cy=team-members-table]').contains('User 016')

    // Perform search by username
    cy.get('[data-cy=team-members-table-search-input]').type('USER 02')
    cy.get('[data-cy=team-members-table-search-submit]').click()
    cy.get('[data-cy=team-members-table-pagination]').contains(
      'Showing 1-6 of 6'
    )
  })
})
