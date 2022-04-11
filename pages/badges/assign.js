import React, { Component } from 'react'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../lib/api-client'
import Button from '../../components/button'
import { format } from 'date-fns'
import { toast } from 'react-toastify'

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
    this.state = {}

    this.loadData = this.loadData.bind(this)
  }

  async componentDidMount () {
    this.loadData()
  }

  async loadData () {
    const { orgId, badgeId, userId } = this.props
    try {
      const [org, badge] = await Promise.all([
        apiClient.get(`/organizations/${orgId}`),
        apiClient.get(`/organizations/${orgId}/badges/${badgeId}`)
      ])

      // Check if user already has the badge
      const user =
        badge.users && badge.users.find((u) => u.id === parseInt(userId))

      this.setState({
        org,
        badge,
        user
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

    if (!this.state.org && !this.state.badge) {
      return <div>Loading...</div>
    }

    const { orgId, badgeId, userId } = this.props
    const { badge, user } = this.state

    return (
      <>
        <div className='page__heading'>
          <h1>{badge.name} Badge</h1>
        </div>
        <section>
          <div className='page__heading'>
            <h2>User: {userId} (OSM id)</h2>
          </div>
          <Formik
            initialValues={{
              assignedAt:
                (user && user.assignedAt && user.assignedAt.substring(0, 10)) ||
                format(Date.now(), 'yyyy-MM-dd'),
              validUntil:
                (user && user.validUntil && user.validUntil.substring(0, 10)) ||
                ''
            }}
            onSubmit={async ({ assignedAt, validUntil }) => {
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
                  toast.info('Badge assigned successfully.')
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
            render={({ isSubmitting, values, errors }) => {
              return (
                <Form>
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
                      value={user ? 'Update' : 'Assign'}
                    />
                    <Button
                      variant='small'
                      href={`/organizations/${orgId}/badges/${badgeId}`}
                      value='Go to badge view'
                    />
                  </ButtonWrapper>
                </Form>
              )
            }}
          />
        </section>
      </>
    )
  }

  render () {
    return <article className='inner page'>{this.renderPageInner()}</article>
  }
}
