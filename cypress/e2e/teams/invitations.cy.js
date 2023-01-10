const user1 = {
  id: 1,
  display_name: 'User 001',
}

const expiredInvitation = {
  uuid: '0a875c3c-ba7c-4132-b08e-427a965177f5',
  teamId: 1,
  createdAt: '2000-01-01',
  expiresAt: '2001-01-01',
}

const validInvitation = {
  uuid: 'f89e8459-3066-43e3-86d5-f621ded69d60',
  teamId: 1,
}

const anotherValidInvitation = {
  uuid: '6d30b44f-e94d-4d40-8dc1-3973d28cb182',
  teamId: 1,
}

const nonexistentInvitation = {
  uuid: '981b595a-92a4-442e-ab39-3a418c20343f',
  teamId: 999,
}

describe('Team invitation page', () => {
  before(() => {
    cy.task('db:reset')
    cy.task('db:seed:create-teams', {
      teams: [
        {
          name: 'Team 1',
        },
        {
          name: 'Team 2',
        },
      ],
      moderatorId: user1.id,
    })

    cy.task('db:seed:team-invitations', [
      expiredInvitation,
      validInvitation,
      anotherValidInvitation,
    ])
  })

  it('Invalid route displays error', () => {
    cy.visit(`/teams/1/invitations/invalid-route`)
    cy.get('body').contains('Invalid team invitation.')
  })

  it('Nonexistent invitation displays error', () => {
    cy.visit(
      `/teams/${nonexistentInvitation.teamId}/invitations/${nonexistentInvitation.uuid}`
    )
    cy.get('body').contains('Invalid team invitation.')
  })

  it('Expired invitation displays error', () => {
    cy.visit(
      `/teams/${expiredInvitation.teamId}/invitations/${expiredInvitation.uuid}`
    )
    cy.get('body').contains('Team invitation has expired.')
  })

  it('Valid invitation - user is not authenticated', () => {
    cy.visit(
      `/teams/${validInvitation.teamId}/invitations/${validInvitation.uuid}`
    )
    cy.get('body').contains('Please sign in')
  })

  it('Valid invitation - user is authenticated', () => {
    cy.login({
      id: 1,
      display_name: 'User 001',
    })
    cy.visit(
      `/teams/${validInvitation.teamId}/invitations/${validInvitation.uuid}`
    )
    cy.get('body').contains('Invitation accepted successfully.')

    cy.visit(
      `/teams/${anotherValidInvitation.teamId}/invitations/${anotherValidInvitation.uuid}`
    )
    cy.get('body').contains('Invitation accepted successfully.')
  })
})
