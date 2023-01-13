import React, { Component, Fragment } from 'react'
import join from 'url-join'
import Router from 'next/router'
import { pick, split } from 'ramda'
import { getTeam, updateTeam, destroyTeam } from '../../../lib/teams-api'
import EditTeamForm from '../../../components/edit-team-form'
import Button from '../../../components/button'
import theme from '../../../styles/theme'
import {
  getOrgTeamAttributes,
  getTeamAttributes,
  getTeamProfile,
} from '../../../lib/profiles-api'
import logger from '../../../lib/logger'

const APP_URL = process.env.APP_URL
export default class TeamEdit extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        id: query.id,
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      error: undefined,
      deleteClickedOnce: false,
    }
  }

  async componentDidMount() {
    const { id } = this.props
    try {
      let team = await getTeam(id)
      let teamAttributes = (await getTeamAttributes(id)) || []
      let orgTeamAttributes = []
      let profileValues = []
      profileValues = await getTeamProfile(id)
      if (team.org) {
        orgTeamAttributes = await getOrgTeamAttributes(team.org.organization_id)
      }
      this.setState({
        team,
        profileValues,
        teamAttributes,
        orgTeamAttributes,
        loading: false,
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

  async deleteTeam() {
    const { id } = this.props
    try {
      const res = await destroyTeam(id)
      if (res.ok) {
        Router.push(join(APP_URL, `/teams`))
      } else {
        throw new Error('Could not delete team')
      }
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
      })
    }
  }

  renderDeleter() {
    let section = (
      <Button
        variant='danger'
        onClick={() => {
          this.setState({
            deleteClickedOnce: true,
          })
        }}
      >
        Delete this team
      </Button>
    )

    if (this.state.deleteClickedOnce) {
      section = (
        <Fragment>
          <Button
            onClick={() => {
              this.setState({
                deleteClickedOnce: false,
              })
            }}
          >
            Cancel
          </Button>
          <Button
            variant='danger'
            onClick={() => {
              this.deleteTeam()
            }}
          >
            Really delete this team?
          </Button>
        </Fragment>
      )
    }
    return section
  }

  render() {
    const { team, error, teamAttributes, orgTeamAttributes, profileValues } =
      this.state

    if (error) {
      if (error.status >= 400 && error.status < 500) {
        return (
          <article className='inner'>
            <h1>Team not found</h1>
          </article>
        )
      } else if (error.status >= 500) {
        return (
          <article className='inner'>
            <h1>Error fetching team</h1>
          </article>
        )
      }
    }

    if (!team) return null

    return (
      <article className='inner page'>
        <section>
          <div className='page__heading'>
            <h1>Edit Team</h1>
            <Button variant='primary' href={`/teams/${team.id}/edit-profiles`}>
              Edit Team Profiles
            </Button>
          </div>
          <EditTeamForm
            initialValues={pick(
              [
                'name',
                'bio',
                'hashtag',
                'editing_policy',
                'location',
                'privacy',
              ],
              team
            )}
            profileValues={profileValues}
            teamTags={teamAttributes}
            orgTeamTags={orgTeamAttributes}
            onSubmit={async (values, actions) => {
              try {
                let tags = Object.keys(values.tags).map((key) => {
                  return {
                    key_id: split('-', key)[1],
                    value: values.tags[key],
                  }
                })

                values.tags = tags

                await updateTeam(team.id, values)
                actions.setSubmitting(false)
                Router.push(join(APP_URL, `/teams/${team.id}`))
              } catch (e) {
                logger.error(e)
                actions.setSubmitting(false)
                // set the form errors actions.setErrors(e)
                actions.setStatus(e.message)
              }
            }}
          />
        </section>
        <section className='danger-zone'>
          <h2>Danger Zone 🎸</h2>
          <p>
            Delete this team, team information and all memberships associated to
            this team
          </p>
          {this.renderDeleter()}
        </section>
        <style jsx global>
          {`
            .form-control {
              flex-direction: column;
              align-items: flex-start;
            }

            .danger-zone {
              border: 1px solid ${theme.colors.secondaryColor};
              background: white;
              margin: 4rem 0;
              padding: 2rem;
            }

            .danger-zone .button {
              margin-right: 2rem;
            }
          `}
        </style>
      </article>
    )
  }
}
