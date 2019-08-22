import React, { Component } from 'react'
import { map, prop, contains, reverse } from 'ramda'
import Popup from 'reactjs-popup'
import dynamic from 'next/dynamic'

import Card from '../components/card'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import Button from '../components/button'
import Table from '../components/table'
import AddMemberForm from '../components/add-member-form'
import theme from '../styles/theme'

import { getTeam, addMember, removeMember } from '../lib/teams-api'

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
      loading: true,
      error: undefined
    }
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

  async removeMember (osmId) {
    const { id } = this.props
    try {
      await removeMember(id, osmId)
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

  renderActions (row, index, columns) {
    return (
      <Popup
        trigger={<span className='pointer'>⚙️</span>}
        position='right top'
        on='click'
        closeOnDocumentClick
        contentStyle={{ padding: '10px', border: 'none' }}
      >
        <ul>
          <li
            onClick={async () => {
              // TODO: show message if error
              // TODO: require confirmation
              if (row.id !== this.props.user.uid) {
                this.removeMember(row.id)
              }
            }}
          >
            Remove team member
          </li>
        </ul>
        <style jsx>
          {`
            ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }

            li {
              padding-left: 0.5rem;
            }

            li:hover {
              color: ${theme.colors.secondaryColor};
            }
          `}
        </style>
      </Popup>
    )
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
            <h1>Error fetching team</h1>
          </article>
        )
      }
    }

    if (!team) return null

    // Check if the user is a moderator for this team
    const moderators = map(prop('osm_id'), team.moderators)
    const isUserModerator = contains(parseInt(this.props.user.uid), moderators)

    let members = team.members

    const columns = [
      { key: 'id' },
      { key: 'name' }
    ]

    if (isUserModerator) {
      columns.push({ key: 'actions' })

      members = members.map((member) => {
        if (isUserModerator) {
          member.actions = (row, index, columns) => {
            return this.renderActions(row, index, columns, isUserModerator)
          }
        }

        return member
      })
    }

    return (
      <article className='inner page team'>
        <div className='page__heading'>
          <h2>{team.name}</h2>
          { isUserModerator ? <Button variant='primary' href={`/teams/${team.id}/edit`}>Edit Team</Button> : <div /> }
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
              rows={members}
              columns={columns}
            />
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
