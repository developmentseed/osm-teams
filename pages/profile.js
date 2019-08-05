import React, { Component } from 'react'
import Router from 'next/router'
import join from 'url-join'
import getConfig from 'next/config'
import Button from '../components/button'
import Chance from 'chance'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import Table from '../components/table'
const chance = Chance()

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

export default class Profile extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: true,
      teams: [],
      error: undefined
    }
  }

  async getTeams () {
    let res = await fetch(join(URL, '/api/teams'))
    if (res.status === 200) {
      return res.json()
    } else {
      throw new Error('Could not retrieve teams')
    }
  }

  async refreshTeams () {
    try {
      let teams = await this.getTeams()
      this.setState({
        teams,
        loading: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        teamsk: [],
        loading: false
      })
    }
  }

  async createTeam () {
    let res = await fetch(join(URL, '/api/teams'), {
      method: 'POST',
      body: JSON.stringify({
        name: `${chance.country({ full: true })} ${chance.animal()} ${chance.pickone([
          'Group', 'Inc.', 'Ltd.', 'Team', 'Associates', 'Party', 'LLC', 'Corp.'
        ]
        )}`,
        hashtag: chance.hashtag()
      }),
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    if (res.status === 200) {
      await this.refreshTeams()
    } else {
      throw new Error('Could not create new team')
    }
  }

  componentDidMount () {
    this.refreshTeams()
  }

  renderTeams () {
    const { teams } = this.state
    if (!teams) return null

    if (teams.length === 0) {
      return <p className='measure-copy'>No teams created</p>
    }

    return (
      <Table
        rows={teams}
        columns={[
          { key: 'id' },
          { key: 'name' },
          { key: 'hashtag' }
        ]}
        onRowClick={(row, index) => {
          Router.push(join(URL, `/team?id=${row.id}`), join(URL, `/teams/${row.id}`))
        }}
      />
    )
  }

  render () {
    if (this.state.loading) return <div>Loading...</div>
    if (this.state.error) return <div> {this.state.error.message} </div>

    return (
      <div className='inner'>
        <h2>Profile</h2>
        <Section>
          <SectionHeader>Your Teams</SectionHeader>
          {this.renderTeams()}
        </Section>
        <Button onClick={() => this.createTeam()} >Create team</Button>
      </div>
    )
  }
}
