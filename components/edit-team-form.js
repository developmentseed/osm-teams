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
            <div className='form-control'>
              <label htmlFor='name'>Name<span className='red'>*</span></label>
              <Field type='text' name='name' required requiredStar className={errors.name ? 'ba b--red' : ''} />
              {errors.name && (
                <div>
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
              <Field type='textarea' name='bio' />
            </div>
            <div className='form-control'>
              <FormMap style={{ height: '300px', width: '100%' }} name='location' value={values.location} onChange={setFieldValue} />
            </div>
            <div className='form-control'>
              { status && status.msg && <div className='f6 red mt1 mb2 pa2 bg-washed-red'>{status.msg}</div> }
              <Button
                disabled={isSubmitting}
                variant='primary'
                onClick={() => {
                  if (!values.name) {
                    setErrors({ name: 'name field is required' })
                    return setStatus({ msg: 'name field is required' })
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
