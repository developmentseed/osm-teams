import React, { Component } from 'react'
import * as Yup from 'yup'
import { Formik, Field, Form } from 'formik'
import APIClient from '../../../../../lib/api-client'
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Heading,
  VStack,
  Select,
} from '@chakra-ui/react'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import join from 'url-join'
import Router from 'next/router'
import logger from '../../../../../lib/logger'
import Link from 'next/link'
import InpageHeader from '../../../../../components/inpage-header'

const URL = process.env.APP_URL

const apiClient = new APIClient()

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
      return (
        <Box as='main' mb={16}>
          <InpageHeader>
            <Heading color='white'>
              An unexpected error occurred, please try again later.
            </Heading>
          </InpageHeader>
        </Box>
      )
    }

    if (!this.state.org && (!this.state.badge || !this.state.badges)) {
      return (
        <Box as='main' mb={16}>
          <InpageHeader>
            <Heading color='white'>Loading...</Heading>
          </InpageHeader>
        </Box>
      )
    }

    const { orgId, userId } = this.props
    const { badges } = this.state

    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Link href={`/organizations/${orgId}`}>← Back to Organization</Link>
          <Heading color='white'>Badge Assignment</Heading>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          <Box as='article' layerStyle={'shadowed'}>
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
                  <VStack as={Form} gap={2} alignItems='flex-start'>
                    <FormControl>
                      <FormLabel>OSM User ID:</FormLabel>
                      <Input
                        isReadOnly
                        isDisabled
                        color={'brand.600'}
                        opacity='1 !important'
                        value={userId}
                      />
                    </FormControl>

                    <FormControl isInvalid={errors.badgeId}>
                      <FormLabel htmlFor='badgeId'>Badge:</FormLabel>
                      <Field
                        as={Select}
                        name='badgeId'
                        id='badgeId'
                        placeholder='Select a badge'
                      >
                        {badges.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </Field>
                      {errors.badgeId && (
                        <FormErrorMessage>{errors.badgeId}</FormErrorMessage>
                      )}
                    </FormControl>
                    <FormControl isRequired isInvalid={errors.assignedAt}>
                      <FormLabel htmlFor='assignedAt'>Assigned At</FormLabel>
                      <Field
                        as={Input}
                        name='assignedAt'
                        id='assignedAt'
                        type='date'
                        value={values.assignedAt}
                      />
                      {errors.assignedAt && (
                        <FormErrorMessage>{errors.assignedAt}</FormErrorMessage>
                      )}
                    </FormControl>
                    <FormControl isInvalid={errors.validUntil}>
                      <FormLabel htmlFor='validUntil'>Valid Until</FormLabel>
                      <Field
                        as={Input}
                        name='validUntil'
                        id='validUntil'
                        type='date'
                        value={values.validUntil}
                      />
                      {errors.validUntil && (
                        <FormErrorMessage>{errors.validUntil}</FormErrorMessage>
                      )}
                    </FormControl>
                    <Flex gap={4}>
                      <Button isDisabled={isSubmitting} type='submit'>
                        Assign
                      </Button>
                      <Button
                        variant='outline'
                        as={Link}
                        href={`/organizations/${orgId}`}
                      >
                        Go to organization view
                      </Button>
                    </Flex>
                  </VStack>
                )
              }}
            />
          </Box>
        </Container>
      </Box>
    )
  }

  render() {
    return <article className='inner page'>{this.renderPageInner()}</article>
  }
}
