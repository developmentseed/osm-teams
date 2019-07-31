import React, { Component } from 'react'
import { map, prop, contains } from 'ramda'
import Popup from 'reactjs-popup'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import Button from '../components/button'
import Table from '../components/table'
import AddMemberForm from '../components/add-member-form'

import { getTeam, addMember, removeMember } from '../lib/teams-api'

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
        <ul className='list pa0 ma0'>
          <li
            className='pointer pa1 pl2 hover-bg-near-white'
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
      </Popup>
    )
  }

  render () {
    const { team, error } = this.state

    if (error) {
      if (error.status >= 400 && error.status < 500) {
        return (
          <article>
            <h1>Team not found</h1>
          </article>
        )
      } else if (error.status >= 500) {
        return (
          <article>
            <h1>Error fetching team</h1>
          </article>
        )
      }
    }

    if (!team) return null

    // Check if the user is a moderator for this team
    const moderators = map(prop('osm_id'), team.moderators)
    const isUserModerator = contains(parseInt(this.props.user.uid), moderators)

    const members = team.members.map((member) => {
      member.actions = (row, index, columns) => {
        return this.renderActions(row, index, columns)
      }

      return member
    })

    return (
      <article>
        <h2>{team.name}</h2>
        { isUserModerator ? <Button href={`/teams/${team.id}/edit`}>Edit Team</Button> : <div /> }
        <Section>
          <SectionHeader>Team Details</SectionHeader>
          <dl>
            <dt>Bio: </dt>
            <dd>{team.bio}</dd>
            <dt>Hashtag: </dt>
            <dd>{team.hashtag}</dd>
          </dl>
        </Section>
        <Section>
          <SectionHeader>Team Members</SectionHeader>
          <Table
            rows={members}
            columns={[
              { key: 'id' },
              { key: 'name' },
              { key: 'actions' }
            ]}
          />
          <div className='mt4'>
            <AddMemberForm
              onSubmit={async ({ osmId }) => {
                await addMember(team.id, osmId)
                return this.getTeam()
              }}
            />
          </div>
        </Section>
      </article>
    )
  }
}
