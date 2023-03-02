import React from 'react'
import { Formik, Field, Form } from 'formik'
import { Button } from '@chakra-ui/react'
import logger from '../lib/logger'

export default function AddMemberForm({ onSubmit }) {
  return (
    <Formik
      initialValues={{ osmId: '' }}
      onSubmit={async (data, actions) => {
        actions.setSubmitting(true)

        try {
          await onSubmit(data)
          actions.setSubmitting(false)
          actions.resetForm({ osmId: '' })
        } catch (e) {
          logger.error(e)
          actions.setSubmitting(false)
          actions.setStatus(e.message)
        }
      }}
      render={({ status, isSubmitting, values }) => {
        const addMemberText = `Add Member ${isSubmitting ? ' 🕙' : ''}`

        return (
          <Form className='form-control'>
            <Field
              type='text'
              name='osmId'
              id='osmId'
              placeholder='OSM ID'
              value={values.osmId}
              style={{ width: '6rem' }}
            />
            {status && status.msg && <div>{status.msg}</div>}
            <Button
              type='submit'
              variant='outline'
              colorScheme='brand'
              disabled={isSubmitting}
            >
              {addMemberText}
            </Button>
          </Form>
        )
      }}
    />
  )
}
