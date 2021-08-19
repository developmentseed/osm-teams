import React, { Component } from 'react'
import Modal from 'react-modal'
import Router from 'next/router'
import join from 'url-join'
import getConfig from 'next/config'
import Button from '../components/button'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import Table from '../components/table'
import { getTeams } from '../lib/teams-api'
import { getMyOrgs } from '../lib/org-api'
import { assoc, flatten, propEq, find } from 'ramda'

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

export default class Profile extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isModalOpen: false,
      loading: true,
      teams: [],
      error: undefined
    }
  }

  openCreateModal () {
    this.setState({
      isModalOpen: true
    })
  }

  async refreshProfileInfo () {
    try {
      let teams = await getTeams({ osmId: this.props.user.uid })
      let orgs = await getMyOrgs({ osmId: this.props.user.id })
      this.setState({
        teams,
        orgs,
        loading: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        teams: [],
        loading: false
      })
    }
  }

  componentDidMount () {
    this.refreshProfileInfo()
  }

  renderTeams () {
    const { teams } = this.state
    if (!teams) return null

    if (teams.length === 0) {
      return <p className='inner page'>No teams</p>
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

  renderOrganizations () {
    const { orgs } = this.state
    if (!orgs) return null

    if (orgs.length === 0) {
      return <p className='inner page'>No orgs</p>
    }

    const memberOrgs = orgs.memberOrgs.map(assoc('role', 'member'))
    const managerOrgs = orgs.managerOrgs.map(assoc('role', 'manager'))
    const ownerOrgs = orgs.ownerOrgs.map(assoc('role', 'owner'))

    let allOrgs = ownerOrgs
    managerOrgs.forEach(org => {
      if (!find(propEq('id', org.id))(allOrgs)) {
        allOrgs.push(org)
      }
    })
    memberOrgs.forEach(org => {
      if (!find(propEq('id', org.id))(allOrgs)) {
        allOrgs.push(org)
      }
    })

    return (
      <Table
        rows={allOrgs}
        columns={[
          { key: 'id' },
          { key: 'name' },
          { key: 'role' }
        ]}
        onRowClick={(row, index) => {
          Router.push(join(URL, `/organizations?id=${row.id}`), join(URL, `/organizations/${row.id}`))
        }}
      />
    )
  }

  render () {
    if (this.state.loading) return <div className='inner page'>Loading...</div>
    if (this.state.error) return <div className='inner page'> {this.state.error.message} </div>

    const { orgs } = this.state
    const hasOrgs = flatten(Object.values(orgs)).length > 0

    return (
      <div className='inner page'>
        <div className='page__heading'>
          <h2>Profile</h2>
          <div>
            <Button variant='primary' onClick={() => this.openCreateModal()} >Create</Button>
          </div>
        </div>
        {
          hasOrgs
            ? (
              <Section>
                <SectionHeader>Your Organizations</SectionHeader>
                {this.renderOrganizations()}
              </Section>)
            : ''
        }
        <Section>
          <SectionHeader>Your Teams</SectionHeader>
          {this.renderTeams()}
        </Section>
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
        }} isOpen={this.state.isModalOpen}>
          <ul>
            <Button variant='primary fixed-size' href='/teams/create' >Create team</Button>
            <Button variant='primary fixed-size' href='/organizations/create' >Create Org</Button>
          </ul>
          <style jsx>{`
          ul {
            width: 300px;
            height: 300px;
            margin: auto;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
          }
          ul li {
            margin-left: auto;
            margin-right: auto;
          }
        `}
          </style>
        </Modal>
      </div>
    )
  }
}
