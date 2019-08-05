import React from 'react'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import Button from '../components/button'
import { FormikMap } from '../components/formikmap'

export default function EditTeamForm ({ initialValues, onSubmit }) {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({ status, isSubmitting, submitForm, values, setFieldValue }) => (
        <Form>
          <div className='mt3'>
            <label htmlFor='name' className='db fw4 lh-copy f6'>Name:</label>
            <Field type='text' name='name' />
            <ErrorMessage name='name' component='div' />
          </div>
          <div className='mt3'>
            <label htmlFor='hashtag' className='db fw4 lh-copy f6'>Hashtag:</label>
            <Field type='text' name='hashtag' />
            <ErrorMessage name='hashtag' component='div' />
          </div>
          <div className='mt3'>
            <label htmlFor='bio' className='db fw4 lh-copy f6'>Description:</label>
            <Field type='textarea' name='bio' />
            <ErrorMessage name='bio' component='div' />
          </div>
          <div className='mt3'>
            <FormikMap name='location' value={values.location} onChange={setFieldValue} />
          </div>
          <div className='mt3'>
            { status && status.msg && <div>{status.msg}</div> }
            <Button disabled={isSubmitting} onClick={() => submitForm()}>Submit</Button>
          </div>
        </Form>
      )}
    />
  )
}
