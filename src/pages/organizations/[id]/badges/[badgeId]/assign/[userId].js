import React, { Component } from 'react'
import * as Yup from 'yup'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../../../../../lib/api-client'
import Button from '../../../../../../components/button'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import join from 'url-join'
import Router from 'next/router'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

const apiClient = new APIClient()

function ButtonWrapper({ children }) {
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

function Section({ children }) {
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

export default class EditBadgeAssignment extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        orgId: query.id,
        badgeId: parseInt(query.badgeId),
        userId: parseInt(query.userId),
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      isDeleting: false,
    }

    this.loadData = this.loadData.bind(this)
  }

  async componentDidMount() {
    this.loadData()
  }

  async loadData() {
    const { orgId, badgeId, userId } = this.props

    try {
      const org = await apiClient.get(`/organizations/${orgId}`)
      const badge = await apiClient.get(
        `/organizations/${orgId}/badges/${badgeId}`
      )
      let assignment
      if (badge && badge.users) {
        assignment = badge.users.find((u) => u.id === parseInt(userId))
      }

      if (!assignment) {
        throw Error('Badge assignment not found.')
      }

      this.setState({
        org,
        badge,
        assignment,
      })
    } catch (error) {
      console.error(error)
      this.setState({
        error,
        loading: false,
      })
    }
  }

  renderPageInner() {
    if (this.state.error) {
      return <div>An unexpected error occurred, please try again later.</div>
    }

    if (!this.state.org && (!this.state.badge || !this.state.badges)) {
      return <div>Loading...</div>
    }

    const { orgId, userId, badgeId } = this.props
    const { badge, assignment } = this.state

    return (
      <>
        <div className='page__heading'>
          <h1>Badge Assignment</h1>
        </div>
        <Section>
          <Formik
            initialValues={{
              assignedAt:
                (assignment &&
                  assignment.assignedAt &&
                  assignment.assignedAt.substring(0, 10)) ||
                format(Date.now(), 'yyyy-MM-dd'),
              validUntil:
                (assignment &&
                  assignment.validUntil &&
                  assignment.validUntil.substring(0, 10)) ||
                '',
            }}
            validationSchema={Yup.object().shape({
              assignedAt: Yup.date().required(
                'Please select an assignment date.'
              ),
              validUntil: Yup.date().when(
                'assignedAt',
                (assignedAt, schema) =>
                  assignedAt &&
                  schema.min(
                    assignedAt,
                    'End date must be after the start date.'
                  )
              ),
            })}
            onSubmit={async ({ assignedAt, validUntil }) => {
              try {
                const payload = {
                  assigned_at: assignedAt,
                  valid_until: validUntil !== '' ? validUntil : null,
                }

                await apiClient.patch(
                  `/organizations/${orgId}/member/${userId}/badge/${badgeId}`,
                  payload
                )
                toast.info('Badge updated successfully.')
                this.loadData()
              } catch (error) {
                console.log(error)
                toast.error(`Unexpected error, please try again later.`)
              }
            }}
            render={({ isSubmitting, values, errors }) => {
              return (
                <Form>
                  <div className='page__heading'>
                    <h2>User: {userId} (OSM id)</h2>
                  </div>
                  <div className='page__heading'>
                    <h2>Badge: {badge && badge.name}</h2>
                  </div>
                  <div className='form-control form-control__vertical'>
                    <label htmlFor='assignedAt'>Assigned At (required)</label>
                    <Field
                      name='assignedAt'
                      type='date'
                      value={values.assignedAt}
                    />
                    {errors.assignedAt && (
                      <div className='form--error'>{errors.assignedAt}</div>
                    )}
                  </div>
                  <div className='form-control form-control__vertical'>
                    <label htmlFor='validUntil'>Valid Until</label>
                    <Field
                      name='validUntil'
                      type='date'
                      value={values.validUntil}
                    />
                    {errors.validUntil && (
                      <div className='form--error'>{errors.validUntil}</div>
                    )}
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
                        isDeleting: false,
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
                  onClick={async () => {
                    this.setState({
                      isDeleting: true,
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

  render() {
    return <article className='inner page'>{this.renderPageInner()}</article>
  }
}
