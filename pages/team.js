import React, { Component } from 'react'
import { map, prop, contains, reverse, assoc } from 'ramda'
import Modal from 'react-modal'
import dynamic from 'next/dynamic'

import Card from '../components/card'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import Button from '../components/button'
import Table from '../components/table'
import AddMemberForm from '../components/add-member-form'
import ProfileModal from '../components/profile-modal'
import theme from '../styles/theme'

import { getTeam, addMember, removeMember, joinTeam, assignModerator, removeModerator } from '../lib/teams-api'
import { getUserTeamProfile } from '../lib/profiles-api'

const Map = dynamic(() => import('../components/team-map'), { ssr: false })

export default class Team extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        id: query.id
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      profileInfo: [],
      profileUserId: '',
      loading: true,
      error: undefined
    }

    this.closeProfileModal = this.closeProfileModal.bind(this)
  }

  async componentDidMount () {
    this.getTeam()
  }

  async getTeam () {
    const { id } = this.props
    try {
      let team = await getTeam(id)
      this.setState({
        team,
        loading: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        team: null,
        loading: false
      })
    }
  }

  async openProfileModal (user) {
    const { id } = this.props

    try {
      const profileInfo = await getUserTeamProfile(id, user.id)
      this.setState({
        profileInfo,
        profileMeta: user,
        modalIsOpen: true
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        team: null,
        loading: false
      })
    }
  }

  async closeProfileModal () {
    this.setState({
      modalIsOpen: false
    })
  }

  async joinTeam () {
    const { id, user } = this.props
    const osmId = user.uid

    try {
      await joinTeam(id, osmId)
      await this.getTeam(id)
    } catch (e) {
      console.error(e)
      this.setState({
        error: e
      })
    }
  }

  renderMap (location) {
    if (!location) {
      return <div>No location specified</div>
    }
    let centerGeojson = location
    let center = reverse(JSON.parse(centerGeojson).coordinates)

    return (
      <Map marker={{ center }} style={{ height: '200px' }} />
    )
  }

  async addModerator (osmId) {
    const { id } = this.props
    try {
      await assignModerator(id, osmId)
      await this.getTeam()
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        loading: false
      })
    }
  }

  async removeModerator (osmId) {
    const { id } = this.props
    try {
      await removeModerator(id, osmId)
      await this.getTeam()
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        loading: false
      })
    }
  }

  async removeMember (osmId) {
    const { id } = this.props
    try {
      await removeMember(id, osmId)
      if (this.state.modalIsOpen) {
        await this.closeProfileModal()
      }
      await this.getTeam()
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        team: null,
        loading: false
      })
    }
  }

  render () {
    const { team, error } = this.state

    if (error) {
      if (error.status === 401 || error.status === 403) {
        return (
          <article className='inner page'>
            <h1>Unauthorized</h1>
          </article>
        )
      } else if (error.status === 404) {
        return (
          <article className='inner page'>
            <h1>Team not found</h1>
          </article>
        )
      } else {
        return (
          <article className='inner page'>
            <h1>Error: {error.message}</h1>
          </article>
        )
      }
    }

    if (!team) return null

    const userId = this.props.user.uid
    const members = map(prop('id'), team.members)
    const moderators = map(prop('osm_id'), team.moderators)

    // TODO: moderators is an array of ints while members are an array of strings. fix this.
    const isUserModerator = contains(parseInt(userId), moderators)
    const isMember = contains(userId, members)

    const columns = [
      { key: 'id' },
      { key: 'name' },
      { key: 'role' }
    ]

    let memberRows = team.members.map(member => {
      const role = contains(parseInt(member.id), moderators) ? 'moderator' : 'member'
      return assoc('role', role, member)
    })

    let profileActions = []

    if (this.state.modalIsOpen) {
      if (this.state.profileMeta.id !== this.props.user.uid) {
        profileActions.push({
          name: 'Remove team member',
          onClick: async () => {
            this.removeMember(this.state.profileMeta.id)
          }
        })
      }
      if (!contains(parseInt(this.state.profileMeta.id), moderators)) {
        profileActions.push({
          name: 'Promote to moderator',
          onClick: async () => {
            this.addModerator(this.state.profileMeta.id)
          }
        })
      } else {
        profileActions.push({
          name: 'Remove moderator',
          onClick: async () => {
            this.removeModerator(this.state.profileMeta.id)
          }
        })
      }
    }

    return (
      <article className='inner page team'>
        <div className='page__heading'>
          <h2>{team.name}</h2>
          { isUserModerator
            ? (
              <div>
                <span style={{ 'margin-right': '1rem' }}>
                  <Button variant='primary' href={`/teams/${team.id}/edit`}>Edit Team</Button>
                </span>
                <Button variant='primary' href={`/teams/${team.id}/edit-profiles`}>Edit Team Profiles</Button>
              </div>
            )
            : ''
          }
          { userId && !isMember ? <Button variant='primary' onClick={() => this.joinTeam()}>Join Team</Button> : '' }
          { !userId ? <Button variant='primary' href={`/login`}>Sign in to join team</Button> : '' }
          { isMember ? <Button variant='primary' href={`/teams/${team.id}/profile`}>Add Your Profile</Button> : ' '}
        </div>
        <div className='team__details'>
          <Card>
            <SectionHeader>Team Details</SectionHeader>
            <dl>
              <dt>Bio: </dt>
              <dd>{team.bio}</dd>
              <dt>Hashtag: </dt>
              <dd>{team.hashtag}</dd>
            </dl>
            {
              team.editing_policy && (
                <a href={team.editing_policy} className='team__editing_policy'>Organized editing policy</a>
              )
            }
            <SectionHeader>Location</SectionHeader>
            { this.renderMap(team.location) }
          </Card>
        </div>
        <div className='team__table'>
          <Section>
            <div className='section-actions'>
              <SectionHeader>Team Members</SectionHeader>
              <div>
                { isUserModerator && (
                  <AddMemberForm
                    onSubmit={async ({ osmId }) => {
                      await addMember(team.id, osmId)
                      return this.getTeam()
                    }}
                  />
                )}
              </div>
            </div>
            <Table
              rows={memberRows}
              columns={columns}
              onRowClick={
                (row) => {
                  this.openProfileModal(row)
                }
              }
            />
            <Modal style={{
              content: {
                maxWidth: '400px',
                maxHeight: '400px',
                left: 'calc(50% - 200px)',
                top: 'calc(50% - 200px)'
              },
              overlay: {
                zIndex: 10000
              }
            }} isOpen={this.state.modalIsOpen}>
              <ProfileModal
                user={this.state.profileMeta}
                attributes={this.state.profileInfo}
                onClose={this.closeProfileModal}
                actions={profileActions}
              />
            </Modal>
          </Section>
        </div>
        <style jsx>
          {`
            .inner.team {
              display: grid;
              grid-template-columns: repeat(12, 1fr);
              grid-gap: ${theme.layout.globalSpacing};
            }

            .page__heading {
              grid-column: 1 / span 12;
            }

            .team__details {
              grid-column: 1 / span 12;
              margin-bottom: 4rem;
            }

            .team__editing_policy {
              margin-bottom: 2rem;
              display: block;
            }

            @media (min-width: ${theme.mediaRanges.medium}) {
              .team__details {
                grid-column: 1 / span 6;
              }
            }

            dl {
              line-height: calc(${theme.layout.globalSpacing} * 2);
              display: flex;
              flex-flow: row wrap;
              margin-bottom: 2rem;
            }

            dt {
              font-family: ${theme.typography.headingFontFamily};
              text-transform: uppercase;
              flex-basis: 20%;
              margin-right: ${theme.layout.globalSpacing};
            }

            dd {
              margin: 0;
              flex-basis: 70%;
              flex-grow: 1;
            }

            .team__table {
              grid-column: 1 / span 12;
            }
          `}
        </style>
      </article>
    )
  }
}
