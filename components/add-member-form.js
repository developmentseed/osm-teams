import React from 'react'
import { Formik, Field, Form, ErrorMessage } from 'formik'

function Button ({ type, disabled }) {
  return (
    <button
      type='submit'
      className='dark-green bw2 ph3 pv2 f6 link dim br1 ba b--dark-green bg-white dib pointer'
      disabled={disabled}
    >
      Add Member
    </button>
  )
}

export default function AddMemberForm ({ onSubmit }) {
  return (
    <Formik
      onSubmit={async (data, actions) => {
        console.log('does it submit')
        try {
          await onSubmit(data)
          actions.setSubmitting(false)
          // rerender page?
        } catch (e) {
          console.error(e)
          actions.setSubmitting(false)
          // set the form errors actions.setErrors(e)
          actions.setStatus(e.message)
        }
      }}
      render={({ status, isSubmitting }) => (
        <Form>
          <Field
            type='text'
            name='osmId'
            className='f6 ba bw2 ph2 pv2 mr2'
            placeholder='OSM ID'
          />
          <ErrorMessage name='osmId' component='div' />
          { status && status.msg && <div>{status.msg}</div> }
          <Button type='submit' disabled={isSubmitting}>
            Add Member
          </Button>
        </Form>
      )}
    />
  )
}
