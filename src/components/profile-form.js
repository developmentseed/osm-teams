import React, { Component } from 'react'
import CreatableSelect from 'react-select/creatable'
import * as Yup from 'yup'
import Router from 'next/router'
import { Formik, Field, useField, Form, ErrorMessage } from 'formik'
import {
  getOrgMemberAttributes,
  getTeamMemberAttributes,
  getMyProfile,
  setMyProfile,
} from '../lib/profiles-api'
import { getOrg } from '../lib/org-api'
import { getTeam } from '../lib/teams-api'
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Heading,
  Text,
  Checkbox,
  Input,
  VStack,
} from '@chakra-ui/react'
import { propOr, prop } from 'ramda'
import logger from '../lib/logger'
import Link from 'next/link'
import InpageHeader from './inpage-header'

function GenderSelectField(props) {
  const [field, meta, { setValue, setTouched }] = useField(props.name)

  const onChange = function (option) {
    if (option) {
      return setValue(option.value)
    } else {
      return setValue(null)
    }
  }

  const options = [
    { value: 'non-binary', label: 'Non-Binary' },
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'undisclosed', label: 'I prefer not to say' },
  ]

  function findOrCreate(fieldValue) {
    let found = options.find((option) => option.value === field.value)
    if (!fieldValue) {
      return null
    }
    if (!found) {
      return { value: fieldValue, label: fieldValue }
    }
    return found
  }

  const styles = {
    control: (provided) => ({
      ...provided,
      minWidth: '220px',
      width: '220px',
      border: `2px solid brand.600`,
    }),
    option: (provided) => ({
      ...provided,
      minWidth: '220px',
      width: '220px',
    }),
  }

  return (
    <FormControl isInvalid={meta.error}>
      <CreatableSelect
        styles={styles}
        isClearable
        formatCreateLabel={(inputValue) => `Write in ${inputValue}`}
        placeholder='Write or select'
        defaultValue={findOrCreate(field.value)}
        options={options}
        onChange={onChange}
        onBlur={setTouched}
      />
      {meta.touched && meta.error ? (
        <ErrorMessage as={FormErrorMessage} name={props.name} />
      ) : null}
    </FormControl>
  )
}

export default class ProfileForm extends Component {
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
      memberAttributes: [],
      orgAttributes: [],
      profileValues: {},
      consentChecked: true,
      loading: true,
      error: undefined,
    }

    this.setConsentChecked = this.setConsentChecked.bind(this)
  }

  async componentDidMount() {
    this.getProfileForm()
  }

  setConsentChecked(checked) {
    this.setState({
      consentChecked: checked,
    })
  }

  async getProfileForm() {
    const { id } = this.props
    try {
      let memberAttributes = []
      let orgAttributes = []
      let org = {}
      let consentChecked = true
      const returnUrl = `/teams/${this.props.id}`
      const team = await getTeam(id)
      if (team.org) {
        org = await getOrg(team.org.organization_id)
        orgAttributes = await getOrgMemberAttributes(team.org.organization_id)
        consentChecked = !(org && org.privacy_policy)
      }
      memberAttributes = await getTeamMemberAttributes(id)
      let profileValues = (await getMyProfile()).tags
      this.setState({
        id,
        returnUrl,
        team,
        memberAttributes,
        consentChecked,
        org,
        orgAttributes,
        profileValues,
        loading: false,
      })
    } catch (e) {
      logger.error(e)
      this.setState({
        error: e,
        loading: false,
      })
    }
  }

  render() {
    let {
      memberAttributes,
      orgAttributes,
      org,
      team,
      profileValues,
      returnUrl,
      consentChecked,
      loading,
    } = this.state
    profileValues = profileValues || {}

    if (loading) {
      return (
        <Box as='main' mb={16}>
          <InpageHeader>
            <Heading color='white'>Loading...</Heading>
          </InpageHeader>
        </Box>
      )
    }

    const allAttributes = memberAttributes.concat(orgAttributes)
    let initialValues = {}

    let schema = {}

    allAttributes.forEach((attr) => {
      // Set initial value from profileValues or to empty string
      initialValues[attr.id] = propOr('', attr.id, profileValues)

      // Set form validator
      switch (attr.key_type) {
        case 'email': {
          schema[attr.id] = Yup.string().email('Invalid email')
          break
        }
        case 'number': {
          schema[attr.id] = Yup.number().typeError('Invalid number')
          break
        }
        case 'url': {
          schema[attr.id] = Yup.string().url('Invalid URL')
          break
        }
        case 'date': {
          schema[attr.id] = Yup.date('Invalid date')
          break
        }
        case 'tel': {
          const phoneRegex =
            /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
          schema[attr.id] = Yup.string().matches(
            phoneRegex,
            'Invalid phone number'
          )
          break
        }
        case 'color': {
          const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
          schema[attr.id] = Yup.string().matches(hexRegex, 'Invalid color code')
          break
        }
        default: {
          if (attr.required) {
            schema[attr.id] = Yup.string()
              .required('This is a required field')
              .nullable()
          } else {
            schema[attr.id] = Yup.string().nullable()
          }
        }
      }
    })
    const yupSchema = Yup.object().shape(schema)

    const teamName = prop('name', team) || 'team'
    const orgName = prop('name', org) || 'org'

    return (
      <Box as='main' mb={16}>
        <InpageHeader>
          <Link href={returnUrl}>← Back to Team Page</Link>
          <Heading color='white'>{teamName}</Heading>
          <Text fontFamily='mono' fontSize='sm' textTransform={'uppercase'}>
            Editing Profile
          </Text>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          <Box layerStyle={'shadowed'} as='article'>
            <Formik
              enableReinitialize
              validateOnBlur
              validationSchema={yupSchema}
              initialValues={initialValues}
              onSubmit={async (values, actions) => {
                const data = Object.keys(values).map((key) => ({
                  key_id: key,
                  value: values[key],
                }))
                actions.setSubmitting(true)
                try {
                  await setMyProfile(data)
                  actions.setSubmitting(false)
                  Router.push(returnUrl)
                } catch (e) {
                  logger.error(e)
                  actions.setSubmitting(false)
                  actions.setStatus(e.message)
                }
              }}
              render={({ status, isSubmitting }) => {
                const addProfileText = `Submit ${isSubmitting ? ' 🕙' : ''}`
                return (
                  <VStack as={Form} gap={2} alignItems='flex-start'>
                    {orgAttributes.length > 0 ? (
                      <>
                        <Heading variant='sectionHead'>
                          Details for <b>{orgName}</b>
                        </Heading>
                        {orgAttributes.map((attribute) => {
                          return (
                            <FormControl
                              key={attribute.name}
                              isRequired={attribute.required}
                            >
                              <FormLabel htmlFor={attribute.id}>
                                {attribute.name}
                              </FormLabel>
                              {attribute.key_type === 'gender' ? (
                                <>
                                  <GenderSelectField
                                    name={attribute.id}
                                    id={attribute.id}
                                  />
                                  <FormHelperText>
                                    Type in or select your gender from the
                                    drop-down.
                                  </FormHelperText>
                                </>
                              ) : (
                                <>
                                  <Field
                                    as={Input}
                                    type={attribute.key_type}
                                    name={attribute.id}
                                    id={attribute.id}
                                    required={attribute.required}
                                  />
                                  <ErrorMessage
                                    as={FormErrorMessage}
                                    name={attribute.id}
                                  />
                                </>
                              )}
                              {attribute.description && (
                                <FormHelperText>
                                  {attribute.description}
                                </FormHelperText>
                              )}
                            </FormControl>
                          )
                        })}
                      </>
                    ) : (
                      ''
                    )}
                    <Heading as='h2' variant='sectionHead'>
                      Details for <b>{teamName}</b>
                    </Heading>
                    {memberAttributes.length > 0
                      ? memberAttributes.map((attribute) => {
                          return (
                            <FormControl
                              key={attribute.name}
                              isRequired={attribute.required}
                            >
                              <FormLabel htmlFor={attribute.id}>
                                {attribute.name}
                              </FormLabel>

                              {attribute.key_type === 'gender' ? (
                                <>
                                  <FormLabel htmlFor={attribute.id}>
                                    Type in or select your gender from the
                                    drop-down.
                                  </FormLabel>
                                  <GenderSelectField
                                    name={attribute.id}
                                    id={attribute.id}
                                  />
                                </>
                              ) : (
                                <>
                                  <Field
                                    as={Input}
                                    type={attribute.key_type}
                                    name={attribute.id}
                                    id={attribute.id}
                                    required={attribute.required}
                                  />
                                  <ErrorMessage
                                    as={FormErrorMessage}
                                    name={attribute.id}
                                  />
                                </>
                              )}
                              {attribute.description && (
                                <FormHelperText>
                                  {attribute.description}
                                </FormHelperText>
                              )}
                            </FormControl>
                          )
                        })
                      : 'No profile form to fill yet'}
                    {org && org.privacy_policy && (
                      <VStack gap={2} alignItems='flex-start'>
                        <Heading variant='sectionHead' as='h2'>
                          Privacy Policy
                        </Heading>
                        <Container
                          maxW='container.sm'
                          overflow={'scroll'}
                          maxH={'24vh'}
                          mb={4}
                          p={2}
                          border='2px solid'
                          borderColor='brand.50'
                        >
                          {org.privacy_policy.body}
                        </Container>
                        <Container
                          maxW='container.sm'
                          overflow={'scroll'}
                          maxH={'24vh'}
                          mb={4}
                          p={2}
                          border='2px solid'
                          borderColor='brand.50'
                        >
                          <FormControl isRequired>
                            <FormLabel
                              display='flex'
                              alignItems={'center'}
                              gap={2}
                            >
                              <Checkbox
                                checked={consentChecked}
                                onChange={(e) =>
                                  this.setConsentChecked(e.target.checked)
                                }
                              />
                              {org.privacy_policy.consentText}
                            </FormLabel>
                          </FormControl>
                        </Container>
                      </VStack>
                    )}
                    {status && status.msg && (
                      <FormErrorMessage>{status.msg}</FormErrorMessage>
                    )}
                    <Flex gap={4}>
                      <Button
                        type='submit'
                        isDisabled={!consentChecked || isSubmitting}
                      >
                        {addProfileText}
                      </Button>
                      <Button
                        variant='outline'
                        colorScheme={'red'}
                        href={returnUrl}
                        as={Link}
                      >
                        Cancel
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
}
