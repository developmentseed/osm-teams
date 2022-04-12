import React, { Component } from 'react'
import Router from 'next/router'
import { getOrg, getOrgStaff, getMembers, addManager, removeManager, addOwner, removeOwner } from '../lib/org-api'
import { getUserOrgProfile } from '../lib/profiles-api'
import Card from '../components/card'
import Section from '../components/section'
import SectionHeader from '../components/section-header'
import Table from '../components/table'
import theme from '../styles/theme'
import AddMemberForm from '../components/add-member-form'
import Button from '../components/button'
import Modal from 'react-modal'
import ProfileModal from '../components/profile-modal'
import { assoc, propEq, find, contains, prop, map } from 'ramda'
import APIClient from '../lib/api-client'
import getConfig from 'next/config'
import join from 'url-join'

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

const apiClient = new APIClient()

export function SectionWrapper (props) {
  return (
    <div>
      {props.children}
      <style jsx>
        {`
          div {
            grid-column: 1 / span 12;
          }
        `}
      </style>
    </div>
  )
}
export default class Organization extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        id: query.id,
        isMemberOfOrg: query.isMemberOfOrg
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      profileInfo: [],
      profileUserId: '',
      members: [],
      managers: [],
      owners: [],
      page: 0,
      loading: true,
      error: undefined
    }

    this.closeProfileModal = this.closeProfileModal.bind(this)
    this.renderBadges = this.renderBadges.bind(this)
    this.getBadges = this.getBadges.bind(this)
  }

  async componentDidMount () {
    await this.getOrg()
    await this.getOrgStaff()
    await this.getBadges()
    return this.getMembers(0)
  }

  async openProfileModal (user) {
    const { id } = this.props

    try {
      const profileInfo = await getUserOrgProfile(id, user.id)
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

  async getOrgStaff () {
    const { id } = this.props
    try {
      let { managers, owners } = await getOrgStaff(id)
      this.setState({
        managers,
        owners
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        managers: [],
        owners: [],
        loading: false
      })
    }
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
    const managerRows = managers.map(assoc('role', 'manager'))
    let allRows = ownerRows
    managerRows.forEach(row => {
      if (!find(propEq('id', row.id))(ownerRows)) {
        ownerRows.push(row)
      }
    })

    return (
      <Table
        rows={allRows}
        columns={columns}
        emptyPlaceHolder={
          this.state.loading ? 'Loading...' : 'This organization has no staff.'
        }
        onRowClick={(row) => this.openProfileModal(row)}
      />
    )
  }

  async getBadges () {
    try {
      const { id: orgId } = this.props
      const badges = await apiClient.get(`/organizations/${orgId}/badges`)
      this.setState({
        badges
      })
    } catch (e) {
      if (e.statusCode === 401) {
        console.log("User doesn't have access to organization badges.")
      } else {
        console.error(e)
      }
    }
  }

  renderBadges () {
    const { id: orgId } = this.props
    const columns = [{ key: 'name' }, { key: 'color' }]

    // Do not render section if badges list cannot be fetched. This might happen
    // on network error but also when the user doesn't have privileges.
    return this.state.badges ? (
      <SectionWrapper>
        <Section>
          <div className='section-actions'>
            <SectionHeader>Badges</SectionHeader>
            <div>
              <Button
                variant='primary small'
                onClick={() =>
                  Router.push(
                    join(URL, `/organizations/${orgId}/badges/add`)
                  )
                }
              >
                Add
              </Button>
            </div>
          </div>
        </Section>
        {this.state.badges && (
          <Table rows={(this.state.badges || []).map((row) => {
            return {
              ...row,
              color: () => (
                <svg width='20' height='20'>
                  <rect width='20' height='20' style={{ fill: row.color }} />
                </svg>
              )
            }
          })} columns={columns} onRowClick={
            ({ id: badgeId }) => Router.push(
              join(URL, `/organizations/${orgId}/badges/${badgeId}`)
            )

          } />
        )}
      </SectionWrapper>
    ) : null
  }

  renderMembers (memberRows) {
    const columns = [
      { key: 'id' },
      { key: 'name' }
    ]
    return (
      <Table
        rows={memberRows}
        columns={columns}
        emptyPlaceHolder={
          this.state.loading
            ? 'Loading...'
            : 'This organization has no members.'
        }
        onRowClick={(row) => this.openProfileModal(row)}
      />
    )
  }

  render () {
    const { org, members, managers, owners, error } = this.state
    if (!org) return null

    const userId = parseInt(this.props.user.uid)
    const ownerIds = map(parseInt, map(prop('id'), owners))
    const managerIds = map(parseInt, map(prop('id'), managers))
    const isUserOwner = contains(userId, ownerIds)
    const disabledLabel = !this.state.loading ? 'primary' : 'disabled'

    const isOrgPublic = (org.privacy === 'public')
    const isMemberOfOrg = org.isMemberOfOrg

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

    let profileActions = []

    if (this.state.modalIsOpen && isUserOwner) {
      const profileId = parseInt(this.state.profileMeta.id)
      const isProfileManager = contains(profileId, managerIds)
      const isProfileOwner = contains(profileId, ownerIds)
      if (profileId !== userId && isProfileOwner) {
        profileActions.push({
          name: 'Remove owner',
          onClick: async () => {
            await removeOwner(org.id, profileId)
            this.getOrg()
          }
        })
      }
      if (profileId !== userId && isProfileManager) {
        if (!isProfileOwner) {
          profileActions.push({
            name: 'Promote to owner',
            onClick: async () => {
              await addOwner(org.id, profileId)
              this.getOrg()
            }
          })
          profileActions.push({
            name: 'Remove manager',
            onClick: async () => {
              await removeManager(org.id, profileId)
              this.getOrg()
            }
          })
        }
      }
    }

    return (
      <article className='inner page team'>
        <div className='page__heading'>
          <h1>{org.name}</h1>
        </div>
        <div className='team__details'>
          <Card>
            <div className='section-actions'>
              <SectionHeader>Org Details</SectionHeader>
              {isUserOwner ? <Button variant='small' href={`/organizations/${org.id}/edit`}>Edit</Button> : ''}
            </div>
            <dl>
              <dt>Bio: </dt>
              <dd>{org.description}</dd>
            </dl>
          </Card>
        </div>
        {(isOrgPublic || isMemberOfOrg) ? (
          <div className='team__table'>
            <Section>
              <div className='section-actions'>
                <SectionHeader>Staff Members</SectionHeader>
                <div>
                  {isUserOwner && (
                    <AddMemberForm
                      onSubmit={async ({ osmId }) => {
                        await addManager(org.id, osmId)
                        return this.getOrg()
                      }}
                    />
                  )}
                </div>
              </div>
            </Section>
            {this.renderStaff(owners, managers)}
          </div>
        ) : <div />}
        {(isOrgPublic || isMemberOfOrg) ? (
          <div className='team__table'>
            <Section>
              <div className='section-actions'>
                <SectionHeader>Organization Members</SectionHeader>
                <div>
                  <span style={{ 'marginRight': '1rem' }}>
                    {this.state.page > 0 ? <Button onClick={() => this.getPrevPage()} disabled={this.state.loading} variant={`${disabledLabel} small`}>Back</Button> : ''}
                  </span>
                  <Button onClick={() => this.getNextPage()} disabled={this.state.loading} variant={`${disabledLabel} small`}>Next</Button>
                </div>
              </div>
            </Section>
            {this.renderMembers(members)}
          </div>
        ) : <div />}
        {this.renderBadges()}
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
