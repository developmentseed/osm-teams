import React, { Component } from 'react'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../lib/api-client'
import Button from '../../components/button'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import join from 'url-join'
import Router from 'next/router'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

const apiClient = new APIClient()

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

function Section ({ children }) {
  return (
    <section>
      {children}
      <style jsx global>{`
      section {
        margin-bottom: 20px;
      }
    }`}</style>
    </section>
  )
}

export default class AssignBadge extends Component {
  static async getInitialProps ({ query }) {
    if (query) {
      return {
        orgId: query.id,
        badgeId: query.badgeId,
        userId: query.userId
      }
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      isDeleting: false
    }

    this.loadData = this.loadData.bind(this)
  }

  async componentDidMount () {
    this.loadData()
  }

  async loadData () {
    const { orgId, badgeId } = this.props

    try {
      const org = await apiClient.get(`/organizations/${orgId}`)
      let badge, badges

      if (badgeId) {
        badge = await apiClient.get(`/organizations/${orgId}/badges/${badgeId}`)
      } else {
        badges = await apiClient.get(`/organizations/${orgId}/badges`)
      }

      this.setState({
        org,
        badge,
        badges
      })
    } catch (error) {
      console.error(error)
      this.setState({
        error,
        loading: false
      })
    }
  }

  renderPageInner () {
    if (this.state.error) {
      return <div>An unexpected error occurred, please try again later.</div>
    }

    if (!this.state.org && (!this.state.badge || !this.state.badges)) {
      return <div>Loading...</div>
    }

    const { orgId, userId } = this.props
    const { badges, badge, user } = this.state

    return (
      <>
        <div className='page__heading'>
          <h1>Badge Assignment</h1>
        </div>
        <Section>
          <Formik
            initialValues={{
              assignedAt:
                (user && user.assignedAt && user.assignedAt.substring(0, 10)) ||
                format(Date.now(), 'yyyy-MM-dd'),
              validUntil:
                (user && user.validUntil && user.validUntil.substring(0, 10)) ||
                ''
            }}
            onSubmit={async ({ assignedAt, validUntil, badgeId }) => {
              try {
                const payload = {
                  assigned_at: assignedAt,
                  valid_until: validUntil !== '' ? validUntil : null
                }

                if (!user) {
                  await apiClient.post(
                    `/organizations/${orgId}/badges/${badgeId}/assign/${userId}`,
                    payload
                  )
                  Router.push(
                    join(
                      URL,
                      `/organizations/${orgId}/badges/${badgeId}/assign/${userId}`
                    )
                  )
                } else {
                  await apiClient.patch(
                    `/organizations/${orgId}/member/${userId}/badge/${badgeId}`,
                    payload
                  )
                  toast.info('Badge updated successfully.')
                }
                this.loadData()
              } catch (error) {
                console.log(error)
                toast.error(`Unexpected error, please try again later.`)
              }
            }}
            render={({ isSubmitting, values }) => {
              return (
                <Form>
                  <div className='page__heading'>
                    <h2>User: {userId} (OSM id)</h2>
                  </div>
                  {badge ? (
                    <div className='page__heading'>
                      <h2>Badge: {badge && badge.name}</h2>
                    </div>
                  ) : (
                    <div className='form-control form-control__vertical'>
                      <label htmlFor='badgeId'>Badge:</label>
                      <Field as='select' name='badgeId'>
                        <option value=''>Select a badge</option>
                        {badges.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </Field>
                    </div>
                  )}
                  <div className='form-control form-control__vertical'>
                    <label htmlFor='assignedAt'>Assigned At (required)</label>
                    <Field
                      name='assignedAt'
                      type='date'
                      value={values.assignedAt}
                    />
                  </div>
                  <div className='form-control form-control__vertical'>
                    <label htmlFor='validUntil'>Valid Until</label>
                    <Field
                      name='validUntil'
                      type='date'
                      value={values.validUntil}
                    />
                  </div>
                  <ButtonWrapper>
                    <Button
                      disabled={isSubmitting}
                      variant='primary'
                      type='submit'
                      value={badge ? 'Update' : 'Assign'}
                    />
                    <Button
                      variant='small'
                      href={`/organizations/${orgId}`}
                      value='Go to organization view'
                    />
                  </ButtonWrapper>
                </Form>
              )
            }}
          />
        </Section>
        {badge && (
          <Section>
            <div>
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
                          `/organizations/${orgId}/member/${userId}/badge/${badge.id}`
                        )
                        Router.push(join(URL, `/organizations/${orgId}`))
                      } catch (error) {
                        toast.error(
                          `There was an error unassigning the badge. Please try again later.`
                        )
                        console.log(error)
                      }
                    }}
                  >
                    Confirm Unassign
                  </Button>
                </>
              ) : (
                <Button
                  variant='danger'
                  type='submit'
                  value='Unassign this badge'
                  onClick={async (e) => {
                    this.setState({
                      isDeleting: true
                    })
                  }}
                />
              )}
            </div>
          </Section>
        )}
      </>
    )
  }

  render () {
    return <article className='inner page'>{this.renderPageInner()}</article>
  }
}
