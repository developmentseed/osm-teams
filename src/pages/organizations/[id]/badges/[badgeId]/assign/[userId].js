import React, { Component } from 'react'
import * as Yup from 'yup'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../../../../../lib/api-client'
import { Box, Button, Container, Flex, Heading } from '@chakra-ui/react'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import join from 'url-join'
import Router from 'next/router'
import logger from '../../../../../../lib/logger'
import Link from 'next/link'
import Badge from '../../../../../../components/badge'
import InpageHeader from '../../../../../../components/inpage-header'

const URL = process.env.APP_URL

const apiClient = new APIClient()

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
      return (
        <Box as='main' mb={16}>
          <InpageHeader>
            <Heading color='white' size='xs'>
              ...loading
            </Heading>
          </InpageHeader>
        </Box>
      )
    }

    const { orgId, userId, badgeId } = this.props
    const { badge, assignment } = this.state

    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Link href={join(URL, `/organizations/${orgId}/badges/${badgeId}`)}>
            ← Back to Badge
          </Link>
          <Heading color='white'>Badge Assignment</Heading>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          <Box mb={8} as='article' layerStyle='shadowed'>
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
                  logger.error(error)
                  toast.error(`Unexpected error, please try again later.`)
                }
              }}
              render={({ isSubmitting, values, errors }) => {
                return (
                  <Form>
                    <dl>
                      <dt>OSM User ID:</dt>
                      <dd> {userId}</dd>
                      {badge && (
                        <>
                          <dt>Badge:</dt>
                          <dd>
                            <Badge dot color={badge.color}>
                              {badge.name}
                            </Badge>
                          </dd>
                        </>
                      )}
                    </dl>
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
                    <Flex gap={4}>
                      <Button isDisabled={isSubmitting} type='submit'>
                        {badge ? 'Update' : 'Assign'}
                      </Button>
                      <Button
                        variant='outline'
                        as={Link}
                        href={`/organizations/${orgId}`}
                      >
                        Return to Organization
                      </Button>
                    </Flex>
                  </Form>
                )
              }}
            />
          </Box>
          {badge && (
            <Box mb={8}>
              <div>
                {this.state.isDeleting ? (
                  <Flex gap={4}>
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
                      colorScheme='red'
                      variant='outline'
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
                          logger.error(error)
                        }
                      }}
                    >
                      Confirm Unassign
                    </Button>
                  </Flex>
                ) : (
                  <Button
                    colorScheme='red'
                    variant='outline'
                    type='submit'
                    onClick={async () => {
                      this.setState({
                        isDeleting: true,
                      })
                    }}
                  >
                    Unassign this badge
                  </Button>
                )}
              </div>
            </Box>
          )}
          {/* <style jsx>
          {`
            dl {
              display: grid;
              grid-template-columns: max-content 1fr;
              gap: 0.25rem 1rem;
            }

            dt {
              font-family: ${theme.typography.headingFontFamily};
              text-transform: uppercase;
            }
            dd {
              font-weight: ${theme.typography.baseFontSemiBold};
            }
          `}
        </style> */}
        </Container>
      </Box>
    )
  }

  render() {
    return <article className='inner page'>{this.renderPageInner()}</article>
  }
}
