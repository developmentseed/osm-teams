const {
  generateSequenceArray,
  addZeroPadding,
} = require('../../../src/lib/utils')

const team1Members = generateSequenceArray(25, 1).map((i) => ({
  id: i,
  name: `User ${addZeroPadding(i, 3)}`,
}))

const [user1] = team1Members

const team1 = {
  name: 'Team 1',
  privacy: 'public',
}

const team2 = {
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

  it('Teams index is public and list teams', () => {
    cy.visit('/teams')
    cy.get('body').should('contain', 'Team 1')
    cy.get('body').should('contain', 'Team 2')
  })
})
