import React, { Component } from 'react'
import Router, { withRouter } from 'next/router'
import {
  getOrg,
  addManager,
  removeManager,
  addOwner,
  removeOwner,
  getOrgStaff,
} from '../../../lib/org-api'
import { getUserOrgProfile } from '../../../lib/profiles-api'
import Section from '../../../components/section'
import SectionHeader from '../../../components/section-header'
import Table from '../../../components/tables/table'
import theme from '../../../styles/theme'
import AddMemberForm from '../../../components/add-member-form'
import SvgSquare from '../../../components/svg-square'
import Button from '../../../components/button'
import Modal from 'react-modal'
import ProfileModal from '../../../components/profile-modal'
import { contains, prop, map } from 'ramda'
import APIClient from '../../../lib/api-client'
import join from 'url-join'
import { getSession } from 'next-auth/react'
import TeamsTable from '../../../components/tables/teams'
import UsersTable from '../../../components/tables/users'
import logger from '../../../lib/logger'

const URL = process.env.APP_URL

const apiClient = new APIClient()

export function SectionWrapper(props) {
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
class Organization extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        id: query.id,
        isMemberOfOrg: query.isMemberOfOrg,
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      org: {
        status: 'idle',
      },
      profileInfo: [],
      profileUserId: '',
      teams: [],
      managers: [],
      owners: [],
      page: 0,
      loading: true,
      error: undefined,
    }

    this.closeProfileModal = this.closeProfileModal.bind(this)
    this.renderBadges = this.renderBadges.bind(this)
    this.getBadges = this.getBadges.bind(this)
  }

  async componentDidMount() {
    this.setState({ session: await getSession() })
    await this.getOrg()
    await this.getOrgStaff()
    await this.getBadges()
  }

  async openProfileModal(user) {
    const { id } = this.props

    try {
      // Fetch profile attributes
      const profileInfo = await getUserOrgProfile(id, user.id)

      // Fetch badges for this organization
      const profileBadges = (
        await apiClient.get(`/user/${user.id}/badges`)
      ).badges.filter((b) => b.organization_id === parseInt(id))

      this.setState({
        profileInfo,
        profileMeta: user,
        profileBadges,
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

  async getOrgStaff() {
    const { id } = this.props
    try {
      let { managers, owners } = await getOrgStaff(id)
      this.setState({
        managers,
        owners,
      })
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        managers: [],
        owners: [],
        loading: false,
      })
    }
  }

  async getOrg() {
    const { id } = this.props
    this.setState({
      org: {
        status: 'loading',
      },
    })

    try {
      let org = await getOrg(id)
      this.setState({
        org: {
          data: org,
          status: 'success',
        },
      })
    } catch (e) {
      this.setState({
        org: {
          error: e,
          status: 'error',
        },
      })
    }
  }

  async getBadges() {
    try {
      const { id: orgId } = this.props
      const badges = await apiClient.get(`/organizations/${orgId}/badges`)
      this.setState({
        badges,
      })
    } catch (e) {
      if (e.statusCode === 401) {
        logger.error("User doesn't have access to organization badges.")
      } else {
        logger.error(e)
      }
    }
  }

  renderBadges() {
    const { id: orgId } = this.props
    const columns = [
      { key: 'name' },
      { key: 'color', render: ({ color }) => <SvgSquare color={color} /> },
    ]

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
                  Router.push(join(URL, `/organizations/${orgId}/badges/add`))
                }
              >
                Add
              </Button>
            </div>
          </div>

          {this.state.badges && (
            <Table
              data-cy='badges-table'
              rows={this.state.badges || []}
              columns={columns}
              onRowClick={({ id: badgeId }) =>
                Router.push(
                  join(URL, `/organizations/${orgId}/badges/${badgeId}`)
                )
              }
            />
          )}
        </Section>
      </SectionWrapper>
    ) : null
  }

  render() {
    const { org, managers, owners, error } = this.state

    // Handle org loading errors
    if (org.status === 'error') {
      if (org.error.status === 401 || org.error.status === 403) {
        return (
          <article className='inner page'>
            <h1>Unauthorized</h1>
          </article>
        )
      } else if (org.error.status === 404) {
        return (
          <article className='inner page'>
            <h1>Org not found</h1>
          </article>
        )
      }
    }

    // Do not render page until org is fetched
    if (org.status !== 'success') {
      return null
    }

    const userId = parseInt(this.state.session.user_id)
    const ownerIds = map(parseInt, map(prop('id'), owners))
    const managerIds = map(parseInt, map(prop('id'), managers))

    const { isManager, isOwner } = org.data
    const isStaff = isManager || isOwner

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

    if (this.state.modalIsOpen && isOwner) {
      const profileId = parseInt(this.state.profileMeta.id)
      const isProfileManager = contains(profileId, managerIds)
      const isProfileOwner = contains(profileId, ownerIds)
      if (profileId !== userId && isProfileOwner) {
        profileActions.push({
          name: 'Remove owner',
          onClick: async () => {
            await removeOwner(org.data.id, profileId)
            this.getOrg()
          },
        })
      }
      if (profileId !== userId && isProfileManager) {
        if (!isProfileOwner) {
          profileActions.push({
            name: 'Promote to owner',
            onClick: async () => {
              await addOwner(org.data.id, profileId)
              this.getOrg()
            },
          })
          profileActions.push({
            name: 'Remove manager',
            onClick: async () => {
              await removeManager(org.data.id, profileId)
              this.getOrg()
            },
          })
        }
      }

      profileActions.push({
        name: 'Assign a Badge',
        onClick: () =>
          Router.push(
            join(
              URL,
              `/organizations/${org.data.id}/badges/assign/${profileId}`
            )
          ),
      })
    }

    return (
      <article className='inner page team'>
        <div className='page__heading'>
          <h1>{org.data.name}</h1>
        </div>
        <div className='team__details'>
          <Section>
            <div className='section-actions'>
              <SectionHeader>Org Details</SectionHeader>
              {isOwner ? (
                <Button
                  variant='small'
                  href={`/organizations/${org.data.id}/edit`}
                >
                  Edit
                </Button>
              ) : (
                ''
              )}
            </div>
            <dl>
              <dt>Bio: </dt>
              <dd>{org.data.description}</dd>
            </dl>
          </Section>
        </div>
        <div className='team__table'>
          <Section>
            <SectionHeader>Teams</SectionHeader>
            <TeamsTable type='org-teams' orgId={org.data.id} />
          </Section>
        </div>

        {isStaff ? (
          <div className='team__table'>
            <Section>
              <div className='section-actions'>
                <SectionHeader>Staff Members</SectionHeader>
                {isOwner && (
                  <AddMemberForm
                    onSubmit={async ({ osmId }) => {
                      await addManager(org.data.id, osmId)
                      return this.getOrg()
                    }}
                  />
                )}
              </div>

              <UsersTable
                isSearchable
                type='org-staff'
                orgId={org.data.id}
                onRowClick={(row) => this.openProfileModal(row)}
              />
            </Section>
          </div>
        ) : (
          <div />
        )}
        {isStaff ? (
          <div className='team__table'>
            <Section>
              <SectionHeader>Organization Members</SectionHeader>
              <UsersTable
                isSearchable
                type='org-members'
                orgId={org.data.id}
                onRowClick={(row) => this.openProfileModal(row)}
              />
            </Section>
          </div>
        ) : (
          <div />
        )}
        {isStaff && this.renderBadges()}
        <Modal
          style={{
            content: {
              maxWidth: '400px',
              maxHeight: '400px',
              left: 'calc(50% - 200px)',
              top: 'calc(50% - 200px)',
            },
            overlay: {
              zIndex: 10000,
            },
          }}
          isOpen={this.state.modalIsOpen}
        >
          <ProfileModal
            user={this.state.profileMeta}
            badges={this.state.profileBadges}
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
              align-content: baseline;
            }

            .page__heading {
              grid-column: 1 / span 12;
            }

            .team__details {
              grid-column: 1 / span 12;
            }

            .team__editing_policy {
              margin-bottom: 2rem;
              display: block;
            }

            dl {
              display: grid;
              grid-template-columns: 12rem 1fr;
              gap: 0.25rem 1rem;
            }

            dt {
              font-family: ${theme.typography.headingFontFamily};
              text-transform: uppercase;
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

export default withRouter(Organization)
