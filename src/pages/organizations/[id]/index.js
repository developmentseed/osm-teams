import React, { Component } from 'react'
import Router, { withRouter } from 'next/router'
import {
  getOrg,
  addManager,
  removeManager,
  addOwner,
  removeOwner,
  getOrgStaff,
} from '../../../lib/org-api'
import { getUserOrgProfile } from '../../../lib/profiles-api'
import { Box, Container, Heading, Button, Flex } from '@chakra-ui/react'
import Table from '../../../components/tables/table'
import AddMemberForm from '../../../components/add-member-form'
import ProfileModal from '../../../components/profile-modal'
import { contains, prop, map } from 'ramda'
import APIClient from '../../../lib/api-client'
import join from 'url-join'
import { getSession } from 'next-auth/react'
import TeamsTable from '../../../components/tables/teams'
import UsersTable from '../../../components/tables/users'
import logger from '../../../lib/logger'
import Link from 'next/link'
import InpageHeader from '../../../components/inpage-header'
import Badge from '../../../components/badge'

const URL = process.env.APP_URL

const apiClient = new APIClient()

class Organization extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        id: query.id,
        isMemberOfOrg: query.isMemberOfOrg,
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      org: {
        status: 'idle',
      },
      profileInfo: [],
      profileUserId: '',
      teams: [],
      managers: [],
      owners: [],
      page: 0,
      loading: true,
      error: undefined,
    }

    this.closeProfileModal = this.closeProfileModal.bind(this)
    this.renderBadges = this.renderBadges.bind(this)
    this.getBadges = this.getBadges.bind(this)
  }

  async componentDidMount() {
    this.setState({ session: await getSession() })
    await this.getOrg()
    await this.getOrgStaff()
    await this.getBadges()
  }

  async openProfileModal(user) {
    const { id } = this.props

    try {
      // Fetch profile attributes
      const profileInfo = await getUserOrgProfile(id, user.id)

      // Fetch badges for this organization
      const profileBadges = (
        await apiClient.get(`/user/${user.id}/badges`)
      ).badges.filter((b) => b.organization_id === parseInt(id))

      this.setState({
        profileInfo,
        profileMeta: user,
        profileBadges,
        modalIsOpen: true,
      })
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        team: null,
        loading: false,
      })
    }
  }

  async closeProfileModal() {
    this.setState({
      modalIsOpen: false,
    })
  }

  async getOrgStaff() {
    const { id } = this.props
    try {
      let { managers, owners } = await getOrgStaff(id)
      this.setState({
        managers,
        owners,
      })
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        managers: [],
        owners: [],
        loading: false,
      })
    }
  }

  async getOrg() {
    const { id } = this.props
    this.setState({
      org: {
        status: 'loading',
      },
    })

    try {
      let org = await getOrg(id)
      this.setState({
        org: {
          data: org,
          status: 'success',
        },
      })
    } catch (e) {
      this.setState({
        org: {
          error: e,
          status: 'error',
        },
      })
    }
  }

  async getBadges() {
    try {
      const { id: orgId } = this.props
      const badges = await apiClient.get(`/organizations/${orgId}/badges`)
      this.setState({
        badges,
      })
    } catch (e) {
      if (e.statusCode === 401) {
        logger.error("User doesn't have access to organization badges.")
      } else {
        logger.error(e)
      }
    }
  }

  renderBadges() {
    const { id: orgId } = this.props
    const columns = [
      {
        key: 'name',
        render: ({ name, color }) => (
          <Badge dot color={color}>
            {name}
          </Badge>
        ),
      },
      {
        key: '',
        render: ({ id: badgeId }) => (
          <Button
            size='sm'
            color='gray.500'
            variant='outline'
            as={Link}
            href={`/organizations/${orgId}/badges/${badgeId}`}
          >
            Edit
          </Button>
        ),
      },
    ]

    // Do not render section if badges list cannot be fetched. This might happen
    // on network error but also when the user doesn't have privileges.
    return this.state.badges ? (
      <Box as='section' layerStyle={'shadowed'}>
        <Flex justifyContent='space-between'>
          <Heading variant='sectionHead'>Badges</Heading>

          <Button
            variant='outline'
            onClick={() =>
              Router.push(join(URL, `/organizations/${orgId}/badges/add`))
            }
          >
            Add
          </Button>
        </Flex>

        {this.state.badges && (
          <Table
            data-cy='badges-table'
            rows={this.state.badges || []}
            columns={columns}
            onRowClick={({ id: badgeId }) =>
              Router.push(
                join(URL, `/organizations/${orgId}/badges/${badgeId}`)
              )
            }
          />
        )}
      </Box>
    ) : null
  }

  render() {
    const { org, managers, owners, error } = this.state

    // Handle org loading errors
    if (org.status === 'error') {
      if (org.error.status === 401 || org.error.status === 403) {
        return (
          <InpageHeader>
            <Heading color='white'>Unauthorized</Heading>
          </InpageHeader>
        )
      } else if (org.error.status === 404) {
        return (
          <InpageHeader>
            <Heading color='white'>Organization not found</Heading>
          </InpageHeader>
        )
      }
    }

    // Do not render page until org is fetched
    if (org.status !== 'success') {
      return null
    }

    const userId = parseInt(this.state.session.user_id)
    const ownerIds = map(parseInt, map(prop('id'), owners))
    const managerIds = map(parseInt, map(prop('id'), managers))

    const { isManager, isOwner } = org.data
    const isStaff = isManager || isOwner

    if (error) {
      if (error.status === 401 || error.status === 403) {
        return (
          <InpageHeader>
            <Heading color='white'>Unauthorized</Heading>
          </InpageHeader>
        )
      } else if (error.status === 404) {
        return (
          <InpageHeader>
            <Heading color='white'>Organization not found</Heading>
          </InpageHeader>
        )
      } else {
        return (
          <InpageHeader>
            <Heading color='white'>Error: {error.message}</Heading>
          </InpageHeader>
        )
      }
    }

    let profileActions = []

    if (this.state.modalIsOpen && isOwner) {
      const profileId = parseInt(this.state.profileMeta.id)
      const isProfileManager = contains(profileId, managerIds)
      const isProfileOwner = contains(profileId, ownerIds)
      if (profileId !== userId && isProfileOwner) {
        profileActions.push({
          name: 'Remove owner',
          onClick: async () => {
            await removeOwner(org.data.id, profileId)
            this.getOrg()
          },
        })
      }
      if (profileId !== userId && isProfileManager) {
        if (!isProfileOwner) {
          profileActions.push({
            name: 'Promote to owner',
            onClick: async () => {
              await addOwner(org.data.id, profileId)
              this.getOrg()
            },
          })
          profileActions.push({
            name: 'Remove manager',
            onClick: async () => {
              await removeManager(org.data.id, profileId)
              this.getOrg()
            },
          })
        }
      }

      profileActions.push({
        name: 'Assign a Badge',
        onClick: () =>
          Router.push(
            join(
              URL,
              `/organizations/${org.data.id}/badges/assign/${profileId}`
            )
          ),
      })
    }

    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Flex justifyContent={'space-between'}>
            <Heading color='white'>{org.data.name}</Heading>
            {isOwner ? (
              <Button as={Link} href={`/organizations/${org.data.id}/edit`}>
                Edit
              </Button>
            ) : (
              ''
            )}
          </Flex>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          {org.data.description && (
            <Box as='section' layerStyle={'shadowed'}>
              <Heading variant='sectionHead'>Organization Description</Heading>
              {org.data.description}
            </Box>
          )}

          <Box layerStyle={'shadowed'} as='section'>
            <Heading variant='sectionHead'>Teams</Heading>
            <TeamsTable type='org-teams' orgId={org.data.id} />
          </Box>

          {isStaff ? (
            <Box as='section' layerStyle={'shadowed'}>
              <Flex justifyContent={'space-between'}>
                <Heading variant='sectionHead'>Staff Members</Heading>
                {isOwner && (
                  <AddMemberForm
                    onSubmit={async ({ osmId }) => {
                      await addManager(org.data.id, osmId)
                      return this.getOrg()
                    }}
                  />
                )}
              </Flex>

              <UsersTable
                isSearchable
                type='org-staff'
                orgId={org.data.id}
                onRowClick={(row) => this.openProfileModal(row)}
              />
            </Box>
          ) : (
            <div />
          )}
          {isStaff ? (
            <Box layerStyle={'shadowed'} as='section'>
              <Heading variant='sectionHead'>Organization Members</Heading>
              <UsersTable
                isSearchable
                type='org-members'
                orgId={org.data.id}
                onRowClick={(row) => this.openProfileModal(row)}
              />
            </Box>
          ) : (
            <div />
          )}
          {isStaff && this.renderBadges()}

          <ProfileModal
            user={this.state.profileMeta}
            badges={this.state.profileBadges}
            attributes={this.state.profileInfo}
            isOpen={this.state.modalIsOpen}
            onClose={this.closeProfileModal}
            actions={profileActions}
          />
        </Container>
      </Box>
    )
  }
}

export default withRouter(Organization)
