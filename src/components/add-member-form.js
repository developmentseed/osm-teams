import React from 'react'
import { Formik, Field, Form, FormErrorMessage } from 'formik'
import { Button, Flex, Input } from '@chakra-ui/react'
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
          <Flex as={Form} alignItems='center'>
            <Field
              as={Input}
              type='text'
              name='osmId'
              id='osmId'
              placeholder='OSM ID'
              value={values.osmId}
              style={{ width: '6rem' }}
            />
            {status && status.msg && (
              <FormErrorMessage>{status.msg}</FormErrorMessage>
            )}
            <Button
              textTransform={'lowercase'}
              type='submit'
              variant='outline'
              isLoading={isSubmitting}
              loadingText='Adding'
              isDisabled={isSubmitting}
            >
              {addMemberText}
            </Button>
          </Flex>
        )
      }}
    />
  )
}
