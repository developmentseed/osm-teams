import React from 'react'
import { Formik, Field, Form } from 'formik'
import descriptionPopup from './description-popup'
import urlRegex from 'url-regex'
import Button from '../components/button'
import dynamic from 'next/dynamic'
import { uniqBy, prop } from 'ramda'

const FormMap = dynamic(() => import('../components/form-map'), { ssr: false })

const isUrl = urlRegex({ exact: true })

function validateUrl (value) {
  if (value && !isUrl.test(value)) return 'Please enter a valid url'
}

function validateName (value) {
  if (!value) return 'Name field is required'
}

function renderError (text) {
  return <div className='form--error'>{text}</div>
}

function renderErrors (errors) {
  const keys = Object.keys(errors)
  return keys.map((key) => {
    return renderError(errors[key])
  })
}

export default function EditTeamForm ({ initialValues, onSubmit, staff, isCreateForm, extraTags = [], profileValues }) {
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
      render={({ status, isSubmitting, submitForm, values, errors, setFieldValue, setErrors, setStatus }) => {
        let uniqueOrgs
        let extraFields
        if (staff && isCreateForm) {
          uniqueOrgs = uniqBy(prop('organization_id'), staff.map(({ name, organization_id }) => {
            return { name, organization_id }
          }))
        }
        if (extraTags.length > 0) {
          extraFields = extraTags.map(({ id, name, required, description }) => {
            return (
              <div className='form-control form-control__vertical' key={`extra-tag-${id}`}>
                <label htmlFor={`extra-tag-${id}`}>{name}
                  {required ? <span className='form--required'>*</span> : ''}
                  {description ? descriptionPopup(description) : ''}
                </label>
                <Field
                  type='text'
                  name={`tags.key-${id}`}
                  required={required}
                  value={values.tags[`key-${id}`]}
                />
              </div>
            )
          })
        }

        return (
          <Form>
            <h2>Details</h2>
            <div className='form-control form-control__vertical'>
              <label htmlFor='name'>Name<span className='form--required'>*</span></label>
              <Field type='text' name='name' required className={errors.name ? 'form--error' : ''} validate={validateName} />
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
              <Field type='url' name='editing_policy' placeholder='https://' validate={validateUrl} />
              <small className='pt1'>URL to your team's editing policy if you have one (include http/https)</small>
              {errors.editing_policy && renderError(errors.editing_policy)}
            </div>
            <div className='form-control form-control__vertical'>
              <label htmlFor='privacy'>Visibility</label>
              <Field as='select' name='privacy'>
                <option value='public'>Public</option>
                <option value='private'>Private</option>
              </Field>
              <small className='pt1'>A private team does not show its member list or team details to non-members.</small>
            </div>
            { staff && isCreateForm
              ? (
                <div className='form-control form-control__vertical'>
                  <label htmlFor='organization'>Add to Organization</label>
                  <Field as='select' name='organization'>
                    <option value=''>No organization</option>
                    {uniqueOrgs.map(({ organization_id, name }) => {
                      return <option value={organization_id}>{name}</option>
                    }
                    )}
                  </Field>
                </div>
              )
              : ''
            }
            {extraTags.length > 0
              ? <>
                <h2>Org Attributes</h2>
                {extraFields}
              </>
              : ''
            }
            <h2>Location</h2>
            <div className='form-control form-control__vertical'>
              <FormMap style={{ height: '300px', width: '100%' }} name='location' value={values.location} onChange={setFieldValue} />
            </div>
            <div className='form-control form-control__vertical'>
              { (status && status.errors) && (renderErrors(status.errors)) }
              <Button
                disabled={isSubmitting}
                variant='primary'
                onClick={() => {
                  if (Object.keys(errors).length) {
                    setErrors(errors)
                    return setStatus({
                      errors
                    })
                  }
                  return submitForm()
                }}
                type='submit'
                value='submit'
              />
            </div>
          </Form>
        )
      }
      }
    />
  )
}
