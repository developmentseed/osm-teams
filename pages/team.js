import React, { Component } from 'react'
import { map, prop, contains, reverse } from 'ramda'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import Button from '../components/button'
import Table from '../components/table'
import { getTeam } from '../lib/teams-api'
import Map from 'pigeon-maps'
import Marker from '../components/marker'

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
      <Map center={center} zoom={10} width={300} height={200} >
        <Marker anchor={center} payload={1} />
      </Map>
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
          <h3>Location</h3>
          { this.renderMap(team.location) }
        </Section>
        <Section>
          <SectionHeader>Team Members</SectionHeader>
          <Table
            rows={team.members}
            columns={[
              { key: 'id' },
              { key: 'name' }
            ]}
          />
        </Section>
      </article>
    )
  }
}
