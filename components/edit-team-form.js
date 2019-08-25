import React from 'react'
import { Formik, Field, Form } from 'formik'
import urlRegex from 'url-regex'
import Button from '../components/button'
import dynamic from 'next/dynamic'
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

export default function EditTeamForm ({ initialValues, onSubmit }) {
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
              <label htmlFor='hashtag'>Hashtag</label>
              <Field type='text' name='hashtag' />
            </div>
            <div className='form-control form-control__vertical'>
              <label htmlFor='bio'>Description</label>
              <Field component='textarea' name='bio' />
            </div>
            <div className='form-control'>
              <label htmlFor='editing_policy'>Organized Editing Policy</label>
              <Field type='url' name='editing_policy' placeholder='https://' validate={validateUrl} />
              <small className='pt1'>URL to your team's editing policy if you have one (include http/https)</small>
              {errors.editing_policy && renderError(errors.editing_policy)}
            </div>
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
              >
                Submit
              </Button>
            </div>
          </Form>
        )
      }
      }
    />
  )
}
