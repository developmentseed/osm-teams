import React from 'react'
import { Formik, Field, Form } from 'formik'
import { assoc } from 'ramda'
import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  VStack,
} from '@chakra-ui/react'
import logger from '../lib/logger'

const validate = (values) => {
  const errors = {}
  if (!values.name || values.name.length < 1) {
    errors.name = 'Required'
  }
  return errors
}

const defaultValues = {
  name: '',
  description: '',
  visibility: 'team',
  required: [],
  key_type: '',
}

export default function ProfileAttributeForm({
  onSubmit,
  initialValues = defaultValues,
  formType = 'team',
}) {
  if (formType === 'org') {
    initialValues['visibility'] =
      initialValues['visibility'] === 'public' ? 'public' : 'org'
  }

  return (
    <Formik
      validate={validate}
      initialValues={initialValues}
      onSubmit={async (values, actions) => {
        actions.setSubmitting(true)

        let data = assoc(
          'required',
          values.required.includes('required'),
          values
        )
        try {
          await onSubmit(data)
          actions.setSubmitting(false)
          actions.resetForm(initialValues)
        } catch (e) {
          logger.error(e)
          actions.setSubmitting(false)
          actions.setStatus(e.message)
        }
      }}
      render={({ errors, status, isSubmitting, values }) => {
        const addAttributeText = `Submit ${isSubmitting ? ' 🕙' : ''}`
        let typeOption = <option value='team'>Team</option>
        if (formType === 'org') {
          typeOption = (
            <>
              <option value='org'>Organization</option>
              <option value='org_staff'>Organization Staff</option>
            </>
          )
        }

        return (
          <VStack as={Form} alignItems='flex-start'>
            <FormControl isRequired isInvalid={errors.name}>
              <FormLabel htmlFor='name'>Name of attribute</FormLabel>
              <Field
                as={Input}
                type='text'
                name='name'
                id='name'
                placeholder='Name of the attribute'
                value={values.name}
                required
              />
              {errors.name ? (
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              ) : null}
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='description'>
                Description of attribute:
              </FormLabel>
              <Field
                as={Textarea}
                name='description'
                id='description'
                placeholder='Describe the attribute'
                value={values.description}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Visibility:</FormLabel>
              <Field
                as={Select}
                type='text'
                name='visibility'
                id='visibility'
                value={values.visibility}
              >
                {typeOption}
                <option value='public'>Public</option>
              </Field>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Type:</FormLabel>
              <Field
                as={Select}
                type='text'
                name='key_type'
                id='key_type'
                value={values.key_type}
                isDisabled={values.key_type}
                placeholder='Select type'
              >
                <option value='text'>Text</option>
                <option value='number'>Number</option>
                <option value='email'>Email</option>
                <option value='url'>URL</option>
                <option value='date'>Date</option>
                <option value='tel'>Telephone</option>
                <option value='color'>Color</option>
                <option value='gender'>Gender</option>
              </Field>
            </FormControl>

            <FormControl>
              <FormLabel
                display='flex'
                gap={2}
                alignItems='center'
                htmlFor='required'
              >
                <Field
                  as={Checkbox}
                  type='checkbox'
                  name='required'
                  id='required'
                  value='required'
                  isChecked={values.required.includes('required')}
                />
                Is this attribute required?
              </FormLabel>
            </FormControl>
            <FormControl>
              <Button type='submit' isDisabled={isSubmitting}>
                {addAttributeText}
              </Button>
              {status && status.msg && (
                <FormErrorMessage>{status.msg}</FormErrorMessage>
              )}
            </FormControl>
          </VStack>
        )
      }}
    />
  )
}
