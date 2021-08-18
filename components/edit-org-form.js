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

const initialValues = {
  name: '',
  description: ''
}

export default function EditOrgForm ({ onSubmit }) {
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
              <Field type='text' name='name' required className={errors.name ? 'form--error' : ''} validate={validateName} />
              {errors.name && renderError(errors.name)}
            </div>
            <div className='form-control form-control__vertical'>
              <label htmlFor='description'>Description</label>
              <Field component='textarea' name='description' />
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
