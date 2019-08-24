import React from 'react'
import { Formik, Field, Form } from 'formik'
import Button from '../components/button'
import dynamic from 'next/dynamic'
const FormMap = dynamic(() => import('../components/form-map'), { ssr: false })

export default function EditTeamForm ({ initialValues, onSubmit }) {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({ status, isSubmitting, submitForm, values, errors, setFieldValue, setErrors, setStatus }) => {
        return (
          <Form>
            <h2>Details</h2>
            <div className='form-control'>
              <label htmlFor='name'>Name<span className='form--required'>*</span></label>
              <Field type='text' name='name' required className={errors.name ? 'form--error' : ''} />
              {errors.name && (
                <div className='form--required'>
                  {errors.name}
                </div>
              )}
            </div>
            <div className='form-control'>
              <label htmlFor='hashtag'>Hashtag</label>
              <Field type='text' name='hashtag' />
            </div>
            <div className='form-control'>
              <label htmlFor='bio'>Description</label>
              <Field component='textarea' name='bio' />
            </div>
            <h2>Location</h2>
            <div className='form-control'>
              <FormMap style={{ height: '300px', width: '100%' }} name='location' value={values.location} onChange={setFieldValue} />
            </div>
            <div className='form-control'>
              { status && status.msg && <div className='status--alert'>{status.msg}</div> }
              <Button
                disabled={isSubmitting}
                variant='primary'
                onClick={() => {
                  if (!values.name) {
                    setErrors({ name: 'Name field is required' })
                    return setStatus({ msg: 'Name field is required' })
                  }
                  return submitForm()
                }}
              >
                Submit
              </Button>
            </div>
            <style jsx>
              {`
                .form-control {
                  flex-direction: column;
                  align-items: flex-start;
                }
              `}
            </style>
          </Form>
        )
      }
      }
    />
  )
}
