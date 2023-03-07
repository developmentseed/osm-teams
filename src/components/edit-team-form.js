import React, { useState } from 'react'
import { Formik, Field, Form } from 'formik'
import urlRegex from 'url-regex'
import { Button, Heading, Tooltip } from '@chakra-ui/react'
import { QuestionOutlineIcon } from '@chakra-ui/icons'
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
  return <div className='form--error'>{text}</div>
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
            ({ id, name, required, description }) => {
              return (
                <div
                  className='form-control form-control__vertical'
                  key={`extra-tag-${id}`}
                >
                  <label htmlFor={`extra-tag-${id}`}>
                    {name}
                    {required ? <span className='form--required'>*</span> : ''}
                    {description ? (
                      <Tooltip label={description} aria-label='tooltip'>
                        <QuestionOutlineIcon />
                      </Tooltip>
                    ) : (
                      ''
                    )}
                  </label>
                  <Field
                    type='text'
                    name={`tags.key-${id}`}
                    required={required}
                    value={values.tags[`key-${id}`]}
                  />
                </div>
              )
            }
          )
        }

        if (teamTags.length > 0) {
          extraTeamFields = teamTags.map(
            ({ id, name, required, description }) => {
              return (
                <div
                  className='form-control form-control__vertical'
                  key={`extra-tag-${id}`}
                >
                  <label htmlFor={`extra-tag-${id}`}>
                    {name}
                    {required ? <span className='form--required'>*</span> : ''}
                    {description ? (
                      <Tooltip label={description} aria-label='tooltip'>
                        <QuestionOutlineIcon />
                      </Tooltip>
                    ) : (
                      ''
                    )}
                  </label>
                  <Field
                    type='text'
                    name={`tags.key-${id}`}
                    required={required}
                    value={values.tags[`key-${id}`]}
                  />
                </div>
              )
            }
          )
        }

        return (
          <Form>
            <Heading variant='sectionHead'>Details</Heading>
            <div className='form-control form-control__vertical'>
              <label htmlFor='name'>
                Name<span className='form--required'>*</span>
              </label>
              <Field
                type='text'
                name='name'
                required
                className={errors.name ? 'form--error' : ''}
                validate={validateName}
              />
              {errors.name && renderError(errors.name)}
            </div>
            <div className='form-control form-control__vertical'>
              <label htmlFor='hashtag'>Hashtag</label>
              <Field type='text' name='hashtag' />
            </div>
            <div className='form-control form-control__vertical'>
              <label htmlFor='bio'>Description</label>
              <Field component='textarea' name='bio' />
            </div>
            <div className='form-control form-control__vertical'>
              <label htmlFor='editing_policy'>Organized Editing Policy</label>
              <Field
                type='url'
                name='editing_policy'
                placeholder='https://'
                validate={validateUrl}
              />
              <small className='pt1'>
                URL to your team&apos;s editing policy if you have one (include
                http/https)
              </small>
              {errors.editing_policy && renderError(errors.editing_policy)}
            </div>
            <div className='form-control form-control__vertical'>
              <label htmlFor='privacy'>Visibility</label>
              <Field as='select' name='privacy'>
                <option value='public'>Public</option>
                <option value='private'>Private</option>
              </Field>
              <small className='pt1'>
                A private team does not show its member list or team details to
                non-members.
              </small>
            </div>
            {staff && isCreateForm && (
              <div className='form-control form-control__vertical'>
                <label htmlFor='orgTeam-checkbox'>
                  <input
                    id='orgTeam-checkbox'
                    name='orgTeam-checkbox'
                    type='checkbox'
                    checked={orgTeam}
                    style={{ minWidth: '1rem' }}
                    onChange={(e) => setOrgTeam(e.target.checked)}
                  />
                  This team belongs to an organization
                </label>
                {orgTeam && (
                  <Field as='select' name='organization'>
                    <option value=''>Select organization</option>
                    {uniqueOrgs.map(({ organization_id, name }) => {
                      return (
                        <option key={organization_id} value={organization_id}>
                          {name}
                        </option>
                      )
                    })}
                  </Field>
                )}
              </div>
            )}
            {extraOrgTeamFields.length > 0 ? (
              <>
                <Heading as='h3' size='sm'>
                  Organization Attributes
                </Heading>
                {extraOrgTeamFields}
              </>
            ) : (
              ''
            )}
            {extraTeamFields.length > 0 ? (
              <>
                <Heading as='h3' size='sm'>
                  Other Team Attributes
                </Heading>
                {extraTeamFields}
              </>
            ) : (
              ''
            )}
            <Heading variant='sectionHead'>Location</Heading>
            <div className='form-control form-control__vertical'>
              <FormMap
                style={{ height: '300px', width: '100%' }}
                name='location'
                value={values.location}
                onChange={setFieldValue}
              />
            </div>
            <div className='form-control form-control__vertical'>
              {status && status.errors && renderErrors(status.errors)}
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
            </div>
          </Form>
        )
      }}
    />
  )
}
