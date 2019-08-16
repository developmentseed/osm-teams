import React, { Component, Fragment } from 'react'
import join from 'url-join'
import Router from 'next/router'
import { pick, map, prop } from 'ramda'
import { getTeam, updateTeam, destroyTeam, getTags, updateTags } from '../lib/teams-api'
import getConfig from 'next/config'
import EditTeamForm from '../components/edit-team-form'
import TagForm from '../components/tag-form'
import Button from '../components/button'
import theme from '../styles/theme'
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
      error: undefined,
      deleteClickedOnce: false
    }
  }

  async componentDidMount () {
    const { id } = this.props
    try {
      let team = await getTeam(id)
      let suggestions = map(prop('tag'), await getTags())
      console.log(suggestions)
      this.setState({
        team,
        suggestions,
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

  async deleteTeam () {
    const { id } = this.props
    try {
      const res = await destroyTeam(id)
      if (res.ok) {
        Router.push(join(publicRuntimeConfig.APP_URL, `/teams`))
      } else {
        throw new Error('Could not delete team')
      }
    } catch (e) {
      console.error(e)
      this.setState({
        error: e
      })
    }
  }

  renderDeleter () {
    let section = (
      <Button
        variant='danger'
        onClick={() => {
          this.setState({
            deleteClickedOnce: true
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
                deleteClickedOnce: false
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

  render () {
    const { team, error } = this.state

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
          <EditTeamForm
            initialValues={pick(['name', 'bio', 'hashtag', 'location'], team)}
            onSubmit={async (values, actions) => {
              try {
                await updateTeam(team.id, values)
                actions.setSubmitting(false)
                Router.push(join(publicRuntimeConfig.APP_URL, `/teams/${team.id}`))
              } catch (e) {
                console.error(e)
                actions.setSubmitting(false)
                // set the form errors actions.setErrors(e)
                actions.setStatus(e.message)
              }
            }}
          />
        </section>
        <section>
          <h2>Tags</h2>
          <TagForm
            tags={map(prop('tag'), team.tags || [])}
            suggestions={this.state.suggestions}
            updateTags={(tags) => updateTags(team.id, tags)}
          />
        </section>
        <section className='danger-zone'>
          <h2>Danger Zone 🎸</h2>
          <p>Delete this team, team information and all memberships associated to this team</p>
          { this.renderDeleter() }

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
