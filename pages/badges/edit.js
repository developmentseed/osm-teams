import React, { Component } from 'react'
import join from 'url-join'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../lib/api-client'
import { getOrg } from '../../lib/org-api'
import Button from '../../components/button'
import Router from 'next/router'
import getConfig from 'next/config'
import { toast } from 'react-toastify'
import theme from '../../styles/theme'
import Table from '../../components/table'
import AddMemberForm from '../../components/add-member-form'

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

const apiClient = new APIClient()

function validateName (value) {
  if (!value) return 'Name field is required'
}

function renderError (text) {
  return <div className='form--error'>{text}</div>
}

function ButtonWrapper ({ children }) {
  return (
    <div>
      {children}
      <style jsx global>{`
      .button {
        margin-right: 10px;
      }
    }`}</style>
    </div>
  )
}

export default class EditBadge extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        orgId: query.id,
        badgeId: query.badgeId
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {}

    this.getOrg = this.getOrg.bind(this)
    this.getBadge = this.getBadge.bind(this)
  }

  async componentDidMount () {
    this.getOrg()
    this.getBadge()
  }

  async getOrg () {
    try {
      let org = await getOrg(this.props.orgId)
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

  async getBadge () {
    try {
      const { orgId, badgeId } = this.props

      const badge = await apiClient.get(
        `/organizations/${orgId}/badges/${badgeId}`
      )
      this.setState({
        badge
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

  renderAssignedMembers ({ orgId, badgeId }) {
    const columns = [{ key: 'id' }, { key: 'name' }, { key: 'role' }]

    const sampleData = [
      { id: 1, username: 'user1' },
      { id: 2, username: 'user2' }
    ]

    return (
      <section>
        <div className='page__heading'>
          <h2>Assigned Members</h2>
        </div>

        <AddMemberForm
          onSubmit={async ({ osmId }) => {
            try {
              await apiClient.post(
                `/organizations/${orgId}/badges/${badgeId}/assign/${osmId}`
              )
              // Router.push(join(URL, `/organizations/${orgId}`))
            } catch (error) {
              console.log(error)
              toast.error(
                `There was an error assigning the badge. Please try again later.`
              )
            }
          }}
        />

        <Table
          rows={sampleData}
          columns={columns}
          onRowClick={(row) => this.openProfileModal(row)}
        />
      </section>
    )
  }

  render () {
    const self = this

    if (!this.state.org || !this.state.badge) {
      return (
        <article className='inner page'>
          <div>Loading...</div>
        </article>
      )
    }

    const { orgId, badgeId } = this.props

    const { badge } = this.state

    return (
      <article className='inner page'>
        <div className='page__heading'>
          <h1>{this.state.org.name}</h1>
        </div>
        <section>
          <div className='page__heading'>
            <h2>Edit Badge</h2>
          </div>
          <Formik
            initialValues={{ name: badge.name, color: badge.color }}
            onSubmit={async ({ name, color }) => {
              try {
                await apiClient.patch(
                  `/organizations/${orgId}/badges/${badgeId}`,
                  {
                    name,
                    color
                  }
                )
                Router.push(join(URL, `/organizations/${orgId}`))
              } catch (error) {
                toast.error(
                  `There was an error editing badge '${name}'. Please try again later.`
                )
                console.log(error)
              }
            }}
            render={({ isSubmitting, values, errors }) => {
              return (
                <Form>
                  <div className='form-control form-control__vertical'>
                    <label htmlFor='name'>
                      Name<span className='form--required'>*</span>
                    </label>
                    <Field
                      type='text'
                      name='name'
                      value={values.name}
                      required
                      className={errors.name ? 'form--error' : ''}
                      validate={validateName}
                    />
                    {errors.name && renderError(errors.name)}
                  </div>
                  <div className='form-control form-control__vertical'>
                    <label htmlFor='color'>Color: {values.color}</label>
                    <Field
                      type='color'
                      name='color'
                      value={values.color}
                      required
                    />
                    {errors.color && renderError(errors.color)}
                  </div>
                  <ButtonWrapper>
                    <Button
                      disabled={isSubmitting}
                      variant='primary'
                      type='submit'
                      value='update'
                    />
                    <Button
                      variant='disable small'
                      onClick={() => {
                        Router.push(
                          join(URL, `/organizations/${self.props.orgId}`)
                        )
                      }}
                      type='submit'
                      value='cancel'
                    />
                  </ButtonWrapper>
                </Form>
              )
            }}
          />
        </section>

        {this.renderAssignedMembers({ orgId, badgeId })}

        <section className='danger-zone'>
          <h2>Danger zone</h2>
          <p>Delete this badge and remove it from all assigned members.</p>
          {this.state.isDeleting ? (
            <>
              <Button
                onClick={() => {
                  this.setState({
                    isDeleting: false
                  })
                }}
              >
                Cancel
              </Button>
              <Button
                variant='danger'
                onClick={async (e) => {
                  e.preventDefault()
                  try {
                    await apiClient.delete(
                      `/organizations/${orgId}/badges/${badgeId}`
                    )
                    Router.push(join(URL, `/organizations/${orgId}`))
                  } catch (error) {
                    toast.error(
                      `There was an error deleting the badge. Please try again later.`
                    )
                    console.log(error)
                  }
                }}
              >
                Confirm Delete
              </Button>
            </>
          ) : (
            <Button
              variant='danger'
              type='submit'
              value='Delete'
              onClick={async (e) => {
                this.setState({
                  isDeleting: true
                })
              }}
            />
          )}
        </section>
        <style jsx global>
          {`
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