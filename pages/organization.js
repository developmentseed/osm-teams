import React, { Component } from 'react'
import { getOrg, getMembers } from '../lib/org-api'
import Card from '../components/card'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import Table from '../components/table'
import theme from '../styles/theme'
import Button from '../components/Button'
import { assoc, propEq, find } from 'ramda'

export default class Organization extends Component {
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
      members: [],
      page: 0,
      loading: true,
      error: undefined
    }
  }

  async componentDidMount () {
    await this.getOrg()
    return this.getMembers(0)
  }

  async getMembers (currentPage) {
    const { id } = this.props
    try {
      let { members, page } = await getMembers(id, currentPage)
      this.setState({
        members,
        page: Number(page),
        loading: false
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        org: null,
        loading: false
      })
    }
  }

  async getNextPage () {
    this.setState({ loading: true })
    await this.getMembers(this.state.page + 1)
  }

  async getPrevPage () {
    this.setState({ loading: true })
    await this.getMembers(this.state.page - 1)
  }

  async getOrg () {
    const { id } = this.props
    try {
      let org = await getOrg(id)
      this.setState({
        org
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        org: null,
        loading: false
      })
    }
  }

  renderStaff (owners, managers) {
    const columns = [
      { key: 'id' },
      { key: 'name' },
      { key: 'role' }
    ]
    const ownerRows = owners.map(assoc('role', 'owner'))
    const managerRows = owners.map(assoc('role', 'manager'))
    let allRows = ownerRows
    managerRows.forEach(row => {
      if (!find(propEq('id', row.id))(ownerRows)) {
        ownerRows.push(row)
      }
    })

    return <Table
      rows={allRows}
      columns={columns}
    />
  }

  renderMembers (memberRows) {
    const columns = [
      { key: 'id' },
      { key: 'name' }
    ]
    return <Table
      rows={memberRows}
      columns={columns}
    />
  }

  render () {
    const { org, members, error } = this.state
    if (!org) return null

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
            <h1>Org not found</h1>
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

    return (
      <article className='inner page team'>
        <div className='page__heading'>
          <h2>{org.name}</h2>
        </div>
        <div className='team__details'>
          <Card>
            <SectionHeader>Org Details</SectionHeader>
            <dl>
              <dt>Bio: </dt>
              <dd>{org.description}</dd>
            </dl>
          </Card>
        </div>
        <div className='team__table'>
          <Section>
            <div className='section-actions'>
              <SectionHeader>Staff Members</SectionHeader>
            </div>
          </Section>
          {this.renderStaff(org.owners, org.managers)}
        </div>
        <div className='team__table'>
          <Section>
            <div className='section-actions'>
              <SectionHeader>Organization Members</SectionHeader>
            </div>
          </Section>
          {this.renderMembers(members)}
          { this.state.page > 0 ? <Button onClick={() => this.getPrevPage()} variant='primary small'>Back</Button> : ''}
          <Button onClick={() => this.getNextPage()} variant='primary small'>Next</Button>
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
