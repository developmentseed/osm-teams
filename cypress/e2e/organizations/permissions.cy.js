const {
  generateSequenceArray,
  addZeroPadding,
} = require('../../../src/lib/utils')

const users = generateSequenceArray(4, 1).map((i) => ({
  id: i,
  name: `User ${addZeroPadding(i, 3)}`,
}))

const [ownerUser, managerUser, orgTeamMember1, nonMember] = users

// ORGANIZATION SEED
const privateOrg = {
  id: 1,
  name: 'Private Org',
  privacy: 'private',
  ownerId: ownerUser.id,
}

const publicOrg = {
  id: 2,
  name: 'Public Org',
  ownerId: ownerUser.id,
}

// ORGANIZATION TEAMS SEED
const privateOrgPrivateTeam = {
  id: 1,
  name: 'Private Org Private Team',
  privacy: 'private',
}

const privateOrgPublicTeam1 = {
  id: 2,
  name: 'Private Org Public Team 1',
}

const privateOrgPublicTeam2 = {
  id: 3,
  name: 'Private Org Public Team 2',
}

describe('Organizations page: Permissions', () => {
  before(() => {
    cy.task('db:reset')
  })

  it('Org is private', () => {
    cy.task('db:seed:add-organizations', [privateOrg, publicOrg])

    // Unauthenticated user cannot access
    cy.visit('/organizations/1')
    cy.get('body').should('contain', 'Sign in with OSM Teams')

    // Non-member cannot access
    cy.login(nonMember)
    cy.visit('/organizations/1')
    cy.get('body').should('contain', 'Unauthorized')

    // Start owner permissions checks
    cy.login(ownerUser)
    cy.visit('/organizations/1')

    // Org is loaded and all tables are present
    cy.get('body').should('contain', 'Private Org')
    cy.get('[data-cy=org-staff-table]').should('exist')
    cy.get('[data-cy=org-members-table]').should('exist')
    cy.get('body').should('contain', 'Badges')

    // Manager permissions
    cy.task('db:seed:add-organization-managers', {
      orgId: privateOrg.id,
      managerIds: [managerUser.id],
    })
    cy.login(managerUser)
    cy.visit('/organizations/1')

    // Org is loaded and badges table is not present
    cy.get('body').should('contain', 'Private Org')
    cy.get('[data-cy=org-staff-table]').should('exist')
    cy.get('[data-cy=org-members-table]').should('exist')
    cy.get('[data-cy=badges-table]').should('not.exist')

    // Create org teams
    cy.task('db:seed:add-organization-teams', {
      orgId: privateOrg.id,
      teams: [
        privateOrgPrivateTeam,
        privateOrgPublicTeam1,
        privateOrgPublicTeam2,
      ],
      managerId: managerUser.id,
    })

    // Org team member can view its own team and the public ones
    cy.task('db:seed:add-members-to-team', {
      teamId: privateOrgPrivateTeam.id,
      members: [orgTeamMember1],
    })
    cy.login(orgTeamMember1)
    cy.visit('/organizations/1')

    // Org is loaded
    cy.get('body').should('contain', 'Private Org')
    cy.get('[data-cy=org-staff-table]').should('not.exist')
    cy.get('[data-cy=org-members-table]').should('not.exist')
    cy.get('[data-cy=badges-table]').should('not.exist')

    // Can see its own team and public ones
    cy.get('[data-cy=org-teams-table]').within(() => {
      cy.get('[data-cy=not-empty-table]').should('exist')
      cy.should('contain', privateOrgPrivateTeam.name)
      cy.should('contain', privateOrgPublicTeam1.name)
      cy.should('contain', privateOrgPublicTeam2.name)
    })
  })
})
