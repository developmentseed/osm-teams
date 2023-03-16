import React, { Component } from 'react'
import { map, prop, contains, reverse, isNil } from 'ramda'
import dynamic from 'next/dynamic'
import { getSession } from 'next-auth/react'
import { withRouter } from 'next/router'
import {
  Box,
  Container,
  Heading,
  Button,
  Text,
  Flex,
  Stack,
} from '@chakra-ui/react'

import AddMemberForm from '../../../components/add-member-form'
import ProfileModal from '../../../components/profile-modal'

import {
  getTeam,
  getTeamModerators,
  addMember,
  removeMember,
  joinTeam,
  assignModerator,
  removeModerator,
} from '../../../lib/teams-api'
import {
  getTeamProfile,
  getUserOrgProfile,
  getUserTeamProfile,
} from '../../../lib/profiles-api'
import { getOrgStaff } from '../../../lib/org-api'
import logger from '../../../lib/logger'
import MembersTable from '../../../components/tables/members-table'
import Link from 'next/link'
import InpageHeader from '../../../components/inpage-header'
import JoinLink from '../../../components/join-link'

const Map = dynamic(() => import('../../../components/team-map'), {
  ssr: false,
})

class Team extends Component {
  static getInitialProps({ query }) {
    return { id: query.id }
  }

  constructor(props) {
    super(props)
    this.state = {
      profileInfo: [],
      profileUserId: '',
      loading: true,
      error: undefined,
    }

    this.closeProfileModal = this.closeProfileModal.bind(this)
  }

  async componentDidMount() {
    this.getTeam()
    this.setState({ session: await getSession() })
  }

  async getTeam() {
    const { id } = this.props
    try {
      let team = await getTeam(id)
      let isMember = team.requesterIsMember
      let teamModerators = await getTeamModerators(id)
      let teamProfile = []
      teamProfile = await getTeamProfile(id)

      let orgOwners = []
      if (team.org) {
        try {
          orgOwners = (await getOrgStaff(team.org.organization_id)).owners
        } catch (e) {
          logger.error("Can't fetch organization owners", e)
        }
      }
      this.setState({
        team,
        teamProfile,
        isMember,
        teamModerators,
        orgOwners,
        loading: false,
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

  async openProfileModal(user) {
    const { id } = this.props
    const { team } = this.state

    try {
      let profileInfo = await getUserTeamProfile(id, user.id)
      if (team.org) {
        let userOrgProfile = await getUserOrgProfile(
          team.org.organization_id,
          user.id
        )
        profileInfo = profileInfo.concat(userOrgProfile)
      }
      this.setState({
        profileInfo,
        profileMeta: user,
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

  async joinTeam() {
    const { id, user } = this.props
    const osmId = user.uid

    try {
      await joinTeam(id, osmId)
      await this.getTeam(id)
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
      })
    }
  }

  renderMap(location) {
    if (!location) {
      return <div>No location specified</div>
    }
    let centerGeojson = location
    let center = reverse(JSON.parse(centerGeojson).coordinates)

    return <Map marker={{ center }} style={{ height: '200px' }} />
  }

  async addModerator(osmId) {
    const { id } = this.props
    try {
      await assignModerator(id, osmId)
      await this.getTeam()
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        loading: false,
      })
    }
  }

  async removeModerator(osmId) {
    const { id } = this.props
    try {
      await removeModerator(id, osmId)
      await this.getTeam()
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        loading: false,
      })
    }
  }

  async removeMember(osmId) {
    const { id } = this.props
    try {
      await removeMember(id, osmId)
      if (this.state.modalIsOpen) {
        await this.closeProfileModal()
      }
      await this.getTeam()
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        team: null,
        loading: false,
      })
    }
  }

  render() {
    const { team, error, isMember, teamProfile, teamModerators, orgOwners } =
      this.state

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
            <Heading color='white'>Team not found</Heading>
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

    if (!team) return null

    const userId = this.state.session?.user_id
    const moderators = map(prop('osm_id'), teamModerators)
    const owners = map(prop('id'), orgOwners)

    const isUserModerator =
      contains(parseInt(userId), moderators) ||
      contains(parseInt(userId), owners)

    const isUserOrgOwner = contains(parseInt(userId), owners)

    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Flex
            direction={['column', null, 'row']}
            justifyContent={'space-between'}
            gap={4}
          >
            <Flex direction='column' gap={2}>
              <Heading color='white'>{team.name}</Heading>
              <Flex gap={[4, 8]}>
                {team.hashtag && (
                  <Stack as='dl' spacing={1}>
                    <Text as='dt' variant='overline'>
                      Hashtag
                    </Text>
                    <Text as='dd'>{team.hashtag}</Text>
                  </Stack>
                )}
                {team.org && (
                  <Stack as='dl' spacing={1}>
                    <Text as='dt' variant='overline'>
                      Organization
                    </Text>
                    <Text as='dd'>
                      <Link
                        href={`/organizations/${team.org.organization_id}`}
                        style={{ textDecoration: 'underline' }}
                      >
                        {team.org.name}
                      </Link>
                    </Text>
                  </Stack>
                )}
                {teamProfile &&
                  teamProfile.map((key) => {
                    if (key.value) {
                      return (
                        <Stack as='dl' spacing={1} key={key}>
                          <Text
                            fontFamily='mono'
                            as='dt'
                            fontSize='sm'
                            textTransform={'uppercase'}
                          >
                            {key.name}
                          </Text>
                          <Text as='dd'>{key.value}</Text>
                        </Stack>
                      )
                    }
                  })}
                {team.editing_policy && (
                  <a
                    href={team.editing_policy}
                    className='team__editing_policy'
                  >
                    Organized editing policy
                  </a>
                )}
              </Flex>
            </Flex>
            <Flex direction='column' alignItems={['stretch', null, 'flex-end']}>
              <Flex direction={['column', null, 'row']} gap={2}>
                {isMember ? (
                  <Button
                    variant='outline'
                    colorScheme='white'
                    as={Link}
                    href={`/teams/${team.id}/profile`}
                  >
                    Edit Your Profile
                  </Button>
                ) : (
                  ' '
                )}
                {isUserModerator ? (
                  <Button
                    variant='outline'
                    colorScheme='white'
                    as={Link}
                    href={`/teams/${team.id}/edit`}
                  >
                    Edit Team
                  </Button>
                ) : (
                  ''
                )}
              </Flex>
              {isUserModerator && <JoinLink id={team.id} />}
            </Flex>
          </Flex>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          {team.bio && (
            <Box as='section' layerStyle='shadowed'>
              <Heading variant='sectionHead'>Team Description</Heading>
              <Text>{team.bio}</Text>
            </Box>
          )}

          <Box my={8}>
            <Box as='section' layerStyle='shadowed'>
              <Heading variant='sectionHead'>Location</Heading>
              {this.renderMap(team.location)}
            </Box>
          </Box>
          {teamModerators.length ? (
            <Box as='section' layerStyle={'shadowed'}>
              <Box mb={2} data-cy='team-members-section'>
                <Flex
                  direction={['column', 'row']}
                  justifyContent={['space-between']}
                >
                  <Heading variant='sectionHead'>Team Members</Heading>
                  <div>
                    {isUserModerator && (
                      <AddMemberForm
                        onSubmit={async ({ osmId }) => {
                          await addMember(team.id, osmId)
                          return this.getTeam()
                        }}
                      />
                    )}
                  </div>
                </Flex>
                <MembersTable
                  teamId={this.props.id}
                  organizationId={team.org?.organization_id}
                  requesterId={userId}
                  displayBadges={!isNil(prop('org', team))}
                  onUsernameClick={this.openProfileModal.bind(this)}
                  moderators={teamModerators}
                  isRequesterModerator={isUserModerator}
                  isRequesterOrgOwner={isUserOrgOwner}
                  removeMember={this.removeMember.bind(this)}
                  addModerator={this.addModerator.bind(this)}
                  removeModerator={this.removeModerator.bind(this)}
                />
                <ProfileModal
                  user={this.state.profileMeta}
                  attributes={this.state.profileInfo}
                  onClose={this.closeProfileModal}
                  isOpen={this.state.modalIsOpen}
                />
              </Box>
            </Box>
          ) : (
            <div />
          )}
        </Container>
      </Box>
    )
  }
}

export default withRouter(Team)
