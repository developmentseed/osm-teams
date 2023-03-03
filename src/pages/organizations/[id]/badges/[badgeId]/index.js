import React, { Component } from 'react'
import join from 'url-join'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../../../../lib/api-client'
import { getOrg } from '../../../../../lib/org-api'
import { Box, Button, Container, Flex, Heading, Text } from '@chakra-ui/react'
import Router from 'next/router'
import { toast } from 'react-toastify'

import Table from '../../../../../components/tables/table'
import { toDateString } from '../../../../../lib/utils'
import logger from '../../../../../lib/logger'
import Link from 'next/link'
import InpageHeader from '../../../../../components/inpage-header'

const URL = process.env.APP_URL

const apiClient = new APIClient()

function validateName(value) {
  if (!value) return 'Name field is required'
}

function renderError(text) {
  return <div className='form--error'>{text}</div>
}

export default class EditBadge extends Component {
  static async getInitialProps({ query }) {
    if (query) {
      return {
        orgId: query.id,
        badgeId: query.badgeId,
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {}

    this.loadData = this.loadData.bind(this)
  }

  async componentDidMount() {
    this.loadData()
  }

  async loadData() {
    const { orgId, badgeId } = this.props
    try {
      const [org, badge, { data: members }, { data: staff }] =
        await Promise.all([
          getOrg(orgId),
          apiClient.get(`/organizations/${orgId}/badges/${badgeId}`),
          apiClient.get(`/organizations/${orgId}/members`),
          apiClient.get(`/organizations/${orgId}/staff`),
        ])

      const assignablePeople = members.concat(staff)

      this.setState({
        org,
        badge,
        assignablePeople,
      })
    } catch (error) {
      logger.error(error)
      this.setState({
        error,
        loading: false,
      })
    }
  }

  renderAssignedMembers({ orgId, badgeId }) {
    const columns = [
      { key: 'displayName', label: 'Display Name' },
      { key: 'id', label: 'OSM ID' },
      { key: 'assignedAt', label: 'Assigned At' },
      { key: 'validUntil', label: 'Valid Until' },
    ]

    const { badge } = this.state
    const users = (badge && badge.users) || []

    return (
      <Box as='article' layerStyle={'shadowed'}>
        <Heading as='h2' variant={'sectionHead'}>
          Assigned Members
        </Heading>

        <Table
          rows={users.map((u) => ({
            ...u,
            assignedAt: u.assignedAt && toDateString(u.assignedAt),
            validUntil: u.validUntil && toDateString(u.validUntil),
          }))}
          emptyPlaceHolder='No members have this badge assigned. Badges can be assigned via user profile actions.'
          columns={columns}
          onRowClick={({ id }) =>
            Router.push(
              join(
                URL,
                `/organizations/${orgId}/badges/${badgeId}/assign/${id}`
              )
            )
          }
        />
      </Box>
    )
  }

  render() {
    const self = this

    if (this.state.error) {
      return (
        <Box as='main' mb={16}>
          <InpageHeader>
            <Heading color='white'>
              An unexpected error occurred, please try again later.
            </Heading>
          </InpageHeader>
        </Box>
      )
    } else if (!this.state.org || !this.state.badge) {
      return (
        <Box as='main' mb={16}>
          <InpageHeader>
            <Heading color='white'>Loading...</Heading>
          </InpageHeader>
        </Box>
      )
    }

    const { orgId, badgeId } = this.props

    const { badge } = this.state

    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Link href={join(URL, `/organizations/${orgId}`)}>
            ← Back to Organization Page
          </Link>
          <Heading color='white'>Edit badge</Heading>
          <Text fontFamily='mono' fontSize='sm' textTransform={'uppercase'}>
            {this.state.org.name}
          </Text>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          <Box as='article' layerStyle={'shadowed'}>
            <Formik
              initialValues={{ name: badge.name, color: badge.color }}
              onSubmit={async ({ name, color }) => {
                try {
                  await apiClient.patch(
                    `/organizations/${orgId}/badges/${badgeId}`,
                    {
                      name,
                      color,
                    }
                  )
                  toast.success('Badge updated successfully.')
                } catch (error) {
                  toast.error(
                    `There was an error editing badge '${name}'. Please try again later.`
                  )
                  logger.error(error)
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
                    <Flex gap={4}>
                      <Button isDisabled={isSubmitting} type='submit'>
                        Update
                      </Button>
                      <Button
                        variant='outline'
                        as={Link}
                        href={`/organizations/${self.props.orgId}`}
                      >
                        Return to Organization
                      </Button>
                    </Flex>
                  </Form>
                )
              }}
            />
          </Box>

          {this.renderAssignedMembers({ orgId, badgeId })}

          <Box
            layerStyle='shadowed'
            as='section'
            borderColor='red.500'
            boxShadow='4px 4px 0 0 var(--chakra-colors-red-500)'
            display='flex'
            flexDirection={'column'}
            alignItems='flex-start'
            gap={2}
          >
            <Heading as='h2' variant='sectionHead' size='md' color='red'>
              Delete Badge
            </Heading>
            <p>Delete this badge and remove it from all assigned members.</p>
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
                  colorScheme='red'
                  variant='outline'
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
                      logger.error(error)
                    }
                  }}
                >
                  Confirm Delete
                </Button>
              </>
            ) : (
              <Button
                colorScheme={'red'}
                variant='outline'
                type='submit'
                onClick={async () => {
                  this.setState({
                    isDeleting: true,
                  })
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    )
  }
}
