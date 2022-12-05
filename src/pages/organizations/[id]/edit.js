import React, { Component, Fragment } from 'react'
import join from 'url-join'
import Router from 'next/router'
import { pick } from 'ramda'
import { getOrg, updateOrg, destroyOrg } from '../../../lib/org-api'
import EditOrgForm from '../../../components/edit-org-form'
import Button from '../../../components/button'
import theme from '../../../styles/theme'

const APP_URL = process.env.APP_URL

export default class OrgEdit extends Component {
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
      let org = await getOrg(id)
      this.setState({
        org,
        loading: false,
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: e,
        team: null,
        loading: false,
      })
    }
  }

  async deleteOrg() {
    const { id } = this.props
    try {
      const res = await destroyOrg(id)
      if (res.ok) {
        Router.push(join(APP_URL, `/profile`))
      } else {
        throw new Error('Could not delete team')
      }
    } catch (e) {
      console.error(e)
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
        Delete this organization
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
              this.deleteOrg()
            }}
          >
            Really delete this team organization?
          </Button>
        </Fragment>
      )
    }
    return section
  }

  render() {
    const { org, error } = this.state

    if (error) {
      if (error.status >= 400 && error.status < 500) {
        return (
          <article className='inner'>
            <h1>Org not found</h1>
          </article>
        )
      } else if (error.status >= 500) {
        return (
          <article className='inner'>
            <h1>Error fetching org</h1>
          </article>
        )
      }
    }

    if (!org) return null

    return (
      <article className='inner page'>
        <section>
          <div className='page__heading'>
            <h1>Edit Org</h1>
          </div>
          <EditOrgForm
            initialValues={pick(
              ['name', 'description', 'privacy', 'teams_can_be_public'],
              org
            )}
            onSubmit={async (values, actions) => {
              try {
                await updateOrg(org.id, values)
                actions.setSubmitting(false)
                Router.push(join(APP_URL, `/organizations/${org.id}`))
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
          <div className='page__heading'>
            <h2>Org Attributes</h2>
          </div>
          <div>
            <span style={{ marginRight: '1rem' }}>
              <Button
                variant='primary'
                href={`/organizations/${org.id}/edit-profiles`}
              >
                Edit Member Attributes
              </Button>
            </span>
            <span style={{ marginRight: '1rem' }}>
              <Button
                variant='primary'
                href={`/organizations/${org.id}/edit-team-profiles`}
              >
                Edit Team Attributes
              </Button>
            </span>
            <Button
              variant='primary'
              href={`/organizations/${org.id}/edit-privacy-policy`}
            >
              Edit Privacy Policy
            </Button>
          </div>
        </section>
        <section className='danger-zone'>
          <h2>Danger Zone 🎸</h2>
          <p>
            Delete this org, org information and all memberships associated to
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
