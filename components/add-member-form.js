import React from 'react'
import { Formik, Field, Form } from 'formik'

function Button ({ type, disabled, children }) {
  return (
    <button
      type='submit'
      className='dark-green bw2 ph3 pv2 f6 link dim br1 ba b--dark-green bg-white dib pointer'
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default function AddMemberForm ({ onSubmit }) {
  return (
    <Formik
      onSubmit={async (data, actions) => {
        actions.setSubmitting(true)

        try {
          await onSubmit(data)
          actions.setSubmitting(false)
          actions.resetForm({ osmId: '' })
        } catch (e) {
          console.error(e)
          actions.setSubmitting(false)
          actions.setStatus(e.message)
        }
      }}
      render={({ status, isSubmitting, values }) => {
        const addMemberText = `Add Member ${isSubmitting ? ' 🕙' : ''}`

        return (
          <Form>
            <Field
              type='text'
              name='osmId'
              className='f6 ba bw2 ph2 pv2 mr2'
              placeholder='OSM ID'
              value={values.osmId}
            />
            { status && status.msg && <div>{status.msg}</div> }
            <Button type='submit' disabled={isSubmitting}>
              {addMemberText}
            </Button>
          </Form>
        )
      }}
    />
  )
}
