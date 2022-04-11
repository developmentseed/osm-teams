import React, { Component } from 'react'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../lib/api-client'
import Button from '../../components/button'
import Router from 'next/router'
import join from 'url-join'
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
          <h1>Badge Assignment</h1>
        </div>
        <section>
          <div className='page__heading'>
            <h2>Badge: {badge.name}</h2>
          </div>
          <div className='page__heading'>
            <h2>
              User: {user.id}
            </h2>
          </div>
          <Formik
            initialValues={{
              assignedAt:
                (user.assignedAt && user.assignedAt.substring(0, 10)) ||
                format(Date.now(), 'yyyy-MM-dd'),
              validUntil:
                (user.validUntil && user.validUntil.substring(0, 10)) || ''
            }}
            onSubmit={async ({ assignedAt, validUntil }) => {
              try {
                await apiClient.patch(
                  `/organizations/${orgId}/member/${userId}/badge/${badgeId}`,
                  {
                    assigned_at: assignedAt,
                    valid_until: validUntil !== '' ? validUntil : null
                  }
                )
                toast.info('Assignment updated successfully.')
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
      </>
    )
  }

  render () {
    return <article className='inner page'>{this.renderPageInner()}</article>
  }
}
