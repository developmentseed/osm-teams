import React, { Component } from 'react'
import * as Yup from 'yup'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../../../../lib/api-client'
import Button from '../../../../../components/button'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import join from 'url-join'
import Router from 'next/router'
import logger from '../../../../../lib/logger'

const URL = process.env.APP_URL

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

export default class NewBadgeAssignment extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        orgId: query.id,
        userId: query.userId,
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      badges: [],
    }

    this.loadData = this.loadData.bind(this)
  }

  async componentDidMount() {
    this.loadData()
  }

  async loadData() {
    const { orgId } = this.props

    try {
      // Fetch data and apply to state
      const org = await apiClient.get(`/organizations/${orgId}`)
      const badges = await apiClient.get(`/organizations/${orgId}/badges`)
      this.setState({
        org,
        badges,
      })
    } catch (error) {
      logger.error(error)
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

    const { orgId, userId } = this.props
    const { badges } = this.state

    return (
      <>
        <div className='page__heading'>
          <h1>Badge Assignment</h1>
        </div>
        <Section>
          <Formik
            initialValues={{
              assignedAt: format(Date.now(), 'yyyy-MM-dd'),
            }}
            validationSchema={Yup.object().shape({
              badgeId: Yup.number()
                .oneOf(badges.map((b) => b.id))
                .required('Please select a badge.'),
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
            onSubmit={async ({ assignedAt, validUntil, badgeId }) => {
              try {
                await apiClient.post(
                  `/organizations/${orgId}/badges/${badgeId}/assign/${userId}`,
                  {
                    assigned_at: assignedAt,
                    valid_until: validUntil,
                  }
                )
                Router.push(
                  join(
                    URL,
                    `/organizations/${orgId}/badges/${badgeId}/assign/${userId}`
                  )
                )
              } catch (error) {
                logger.error(error)

                if (error.message === 'User is already assigned to badge.') {
                  toast.error(
                    `User is already assigned to this badge, please select a different one.`
                  )
                } else {
                  toast.error(`Unexpected error, please try again later.`)
                }
              }
            }}
            render={({ isSubmitting, values, errors }) => {
              return (
                <Form>
                  <div className='page__heading'>
                    <h2>User: {userId} (OSM id)</h2>
                  </div>

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
                    {errors.badgeId && (
                      <div className='form--error'>{errors.badgeId}</div>
                    )}
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
                      value='Assign'
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
      </>
    )
  }

  render() {
    return <article className='inner page'>{this.renderPageInner()}</article>
  }
}
