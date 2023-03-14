import React, { useState } from 'react'
import { Formik, Field, Form } from 'formik'
import urlRegex from 'url-regex'
import {
  Button,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Textarea,
  Select,
  Checkbox,
  VStack,
} from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import { uniqBy, prop } from 'ramda'

const FormMap = dynamic(() => import('../components/form-map'), { ssr: false })

const isUrl = urlRegex({ exact: true })

function validateUrl(value) {
  if (value && !isUrl.test(value)) return 'Please enter a valid url'
}

function validateName(value) {
  if (!value) return 'Name field is required'
}

function renderError(text) {
  return <FormErrorMessage>{text}</FormErrorMessage>
}

function renderErrors(errors) {
  const keys = Object.keys(errors)
  return keys.map((key) => {
    return renderError(errors[key])
  })
}

export default function EditTeamForm({
  initialValues,
  onSubmit,
  staff,
  isCreateForm,
  orgTeamTags = [],
  teamTags = [],
  profileValues,
}) {
  const [orgTeam, setOrgTeam] = useState(false)
  if (profileValues) {
    initialValues.tags = {}
    profileValues.forEach(({ id, value }) => {
      initialValues.tags[`key-${id}`] = value
    })
  }
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({
        status,
        isSubmitting,
        submitForm,
        values,
        errors,
        setFieldValue,
        setErrors,
        setStatus,
      }) => {
        let uniqueOrgs
        let extraOrgTeamFields = []
        let extraTeamFields = []
        if (staff && isCreateForm) {
          uniqueOrgs = uniqBy(
            prop('organization_id'),
            staff.map(({ name, organization_id }) => {
              return { name, organization_id }
            })
          )
        }
        if (orgTeamTags.length > 0) {
          extraOrgTeamFields = orgTeamTags.map(
            ({ id, name, key_type, required, description }) => {
              return (
                <FormControl isRequired={required} key={`extra-tag-${id}`}>
                  <FormLabel htmlFor={`extra-tag-${id}`}>{name}</FormLabel>
                  <Field
                    as={Input}
                    type={key_type}
                    name={`tags.key-${id}`}
                    id={`extra-tag-${id}`}
                    required={required}
                    value={values.tags[`key-${id}`]}
                  />
                  {description && (
                    <FormHelperText>{description}</FormHelperText>
                  )}
                </FormControl>
              )
            }
          )
        }

        if (teamTags.length > 0) {
          extraTeamFields = teamTags.map(
            ({ id, name, key_type, required, description }) => {
              return (
                <FormControl isRequired={required} key={`extra-tag-${id}`}>
                  <FormLabel htmlFor={`extra-tag-${id}`}>{name}</FormLabel>
                  <Field
                    as={Input}
                    type={key_type}
                    name={`tags.key-${id}`}
                    id={`extra-tag-${id}`}
                    required={required}
                    value={values.tags[`key-${id}`]}
                  />
                  {description && (
                    <FormHelperText>{description}</FormHelperText>
                  )}
                </FormControl>
              )
            }
          )
        }

        return (
          <Form>
            <VStack alignItems={'flex-start'}>
              <Heading variant='sectionHead'>Team Details</Heading>
              <FormControl isRequired isInvalid={errors.name}>
                <FormLabel htmlFor='name'>Name</FormLabel>
                <Field
                  as={Input}
                  type='text'
                  name='name'
                  id='name'
                  required
                  className={errors.name ? 'form--error' : ''}
                  validate={validateName}
                />
                {errors.name && renderError(errors.name)}
              </FormControl>
              <FormControl>
                <FormLabel htmlFor='hashtag'>Hashtag</FormLabel>
                <Field as={Input} type='text' name='hashtag' id='hashtag' />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor='bio'>Description</FormLabel>
                <Field
                  as={Textarea}
                  name='bio'
                  id='bio'
                  placeholder='Enter team description'
                />
              </FormControl>
              <FormControl isInvalid={errors.editing_policy}>
                <FormLabel htmlFor='editing_policy'>
                  Organized Editing Policy
                </FormLabel>
                <Field
                  as={Input}
                  type='url'
                  name='editing_policy'
                  id='editing_policy'
                  placeholder='https://'
                  validate={validateUrl}
                />
                <FormHelperText>
                  URL to your team&apos;s editing policy if you have one
                  (include http/https)
                </FormHelperText>
                {errors.editing_policy && renderError(errors.editing_policy)}
              </FormControl>
              <FormControl>
                <FormLabel htmlFor='privacy'>Visibility</FormLabel>
                <Field
                  as={Select}
                  id='privacy'
                  name='privacy'
                  placeholder='Select Visibility'
                >
                  <option value='public'>Public</option>
                  <option value='private'>Private</option>
                </Field>
                <FormHelperText>
                  A private team does not show its member list or team details
                  to non-members.
                </FormHelperText>
              </FormControl>
              {staff && isCreateForm && (
                <FormControl>
                  <FormLabel htmlFor='orgTeam-checkbox'>
                    <Checkbox
                      id='orgTeam-checkbox'
                      name='orgTeam-checkbox'
                      type='checkbox'
                      checked={orgTeam}
                      style={{ minWidth: '1rem' }}
                      onChange={(e) => setOrgTeam(e.target.checked)}
                    />
                    This team belongs to an organization
                  </FormLabel>
                  {orgTeam && (
                    <Field
                      as={Select}
                      name='organization'
                      placeholder='Select Organization'
                    >
                      {uniqueOrgs.map(({ organization_id, name }) => {
                        return (
                          <option key={organization_id} value={organization_id}>
                            {name}
                          </option>
                        )
                      })}
                    </Field>
                  )}
                </FormControl>
              )}
              {extraOrgTeamFields.length > 0 ? (
                <>
                  <Heading as='h3' size='sm' variant='sectionHead'>
                    Organization Attributes
                  </Heading>
                  {extraOrgTeamFields}
                </>
              ) : (
                ''
              )}
              {extraTeamFields.length > 0 ? (
                <>
                  <Heading as='h3' size='sm' variant='sectionHead'>
                    Other Team Attributes
                  </Heading>
                  {extraTeamFields}
                </>
              ) : (
                ''
              )}
              <Heading variant='sectionHead'>Location</Heading>
              <FormMap
                style={{ height: '300px', width: '100%' }}
                name='location'
                value={values.location}
                onChange={setFieldValue}
              />
              <FormControl>
                <Button
                  isDisabled={isSubmitting}
                  variant='solid'
                  onClick={() => {
                    if (Object.keys(errors).length) {
                      setErrors(errors)
                      return setStatus({
                        errors,
                      })
                    }
                    return submitForm()
                  }}
                  type='submit'
                >
                  Submit
                </Button>
                {status && status.errors && renderErrors(status.errors)}
              </FormControl>
            </VStack>
          </Form>
        )
      }}
    />
  )
}
