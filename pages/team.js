import React, { Component } from 'react'
import join from 'url-join'
import getConfig from 'next/config'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import Table from '../components/table'
const { publicRuntimeConfig } = getConfig()

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
      let team = await this.getTeam(id)
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

  async getTeam (id) {
    let res = await fetch(join(publicRuntimeConfig.APP_URL, `/api/teams/${id}`))
    if (res.status === 200) {
      return res.json()
    } else {
      const err = new Error('could not retrieve team')
      err.status = res.status
      throw err
    }
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

    return (
      <article>
        <h2>{team.name}</h2>
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
