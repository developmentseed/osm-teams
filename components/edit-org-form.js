import React from 'react'
import { Formik, Field, Form } from 'formik'
import Button from '../components/button'

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

const defaultValues = {
  name: '',
  description: '',
}

export default function EditOrgForm ({ initialValues = defaultValues, onSubmit }) {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({ status, isSubmitting, submitForm, values, errors, setFieldValue, setErrors, setStatus }) => {
        return (
          <Form>
            <h2>Details</h2>
            <div className='form-control form-control__vertical'>
              <label htmlFor='name'>Name<span className='form--required'>*</span></label>
              <Field type='text' name='name' value={values.name} required className={errors.name ? 'form--error' : ''} validate={validateName} />
              {errors.name && renderError(errors.name)}
            </div>
            <div className='form-control form-control__vertical'>
              <label htmlFor='description'>Description</label>
              <Field value={values.description} component='textarea' name='description' />
            </div>
            <div className='form-control form-control__vertical'>
              <label htmlFor='privacy'>Visibility</label>
              <Field as='select' name='privacy'>
                <option value='public'>Public</option>
                <option value='private'>Private</option>
              </Field>
              <small className='pt1'>A private organization does not show its member list or team details to non-members.</small>
            </div>
            <div className='form-control form-control__vertical'>
              <label htmlFor='teams_can_be_public'>Teams can be public</label>
              <Field as='select' name='teams_can_be_public'>
                <option value='true'>Yes</option>
                <option value='false'>No</option>
              </Field>
              <small className='pt1'>This overrides the org teams visibility setting.</small>
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
