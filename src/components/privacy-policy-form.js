import React from 'react'
import { Formik, Field, Form } from 'formik'
import { Button } from '@chakra-ui/react'

function validateBody(value) {
  if (!value) return 'Body of privacy policy is required'
}

function validateConsentText(value) {
  if (!value) return 'Consent Text of privacy policy is required'
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

export default function PrivacyPolicyForm({ initialValues, onSubmit }) {
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
        setErrors,
        setStatus,
      }) => {
        return (
          <Form>
            <div className='form-control form-control__vertical'>
              <label htmlFor='body'>
                Body<span className='form--required'>*</span>
              </label>
              <Field
                cols={40}
                rows={6}
                component='textarea'
                name='body'
                value={values.body}
                required
                className={errors.body ? 'form-error' : ''}
                validate={validateBody}
              />
            </div>
            <div className='form-control form-control__vertical'>
              <label htmlFor='consentText'>
                Consent Text<span className='form--required'>*</span>
              </label>
              <Field
                cols={40}
                rows={6}
                component='textarea'
                name='consentText'
                value={values.consentText}
                required
                className={errors.consentText ? 'form-error' : ''}
                validate={validateConsentText}
              />
            </div>
            <div className='form-control form-control__vertical'>
              {status && status.errors && renderErrors(status.errors)}
              <Button
                disabled={isSubmitting}
                variant='primary'
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
                value='submit'
              />
            </div>
          </Form>
        )
      }}
    />
  )
}
