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
            <div className='mt3'>
              <label htmlFor='name' className='db fw4 lh-copy f6'>Name<span className='red'>*</span></label>
              <Field type='text' name='name' required requiredStar className={errors.name ? 'ba b--red' : ''} />
              {errors.name && (
                <div className='f6 red mt1'>
                  {errors.name}
                </div>
              )}
            </div>
            <div className='mt3'>
              <label htmlFor='hashtag' className='db fw4 lh-copy f6'>Hashtag</label>
              <Field type='text' name='hashtag' />
            </div>
            <div className='mt3'>
              <label htmlFor='bio' className='db fw4 lh-copy f6'>Description</label>
              <Field type='textarea' name='bio' />
            </div>
            <div className='mt3'>
              <FormMap style={{ height: '300px' }} name='location' value={values.location} onChange={setFieldValue} />
            </div>
            <div className='mt3'>
              { status && status.msg && <div className='f6 red mt1 mb2 pa2 bg-washed-red'>{status.msg}</div> }
              <Button
                disabled={isSubmitting}
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
          </Form>
        )
      }}
    />
  )
}
