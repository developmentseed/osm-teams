import React from 'react'
import { Formik, Field, Form } from 'formik'
import {
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
} from '@chakra-ui/react'

function validateName(value) {
  if (!value) return 'Name field is required'
}

function renderError(text) {
  return <FormErrorMessage>{text}</FormErrorMessage>
}

function renderErrors(errors) {
  const keys = Object.keys(errors)
  return keys.map((key) => {
    return renderError(errors[key])
  })
}

const defaultValues = {
  name: '',
  description: '',
}

export default function EditOrgForm({
  initialValues = defaultValues,
  onSubmit,
}) {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({
        status,
        isSubmitting,
        submitForm,
        values,
        errors,
        setErrors,
        setStatus,
      }) => {
        return (
          <VStack as={Form} alignItems='flex-start'>
            <Heading as='h2' variant='sectionHead'>
              Details
            </Heading>
            <FormControl isRequired isInvalid={errors.name}>
              <FormLabel>Name</FormLabel>
              <Field
                as={Input}
                type='text'
                name='name'
                id='name'
                value={values.name}
                required
                className={errors.name ? 'form--error' : ''}
                validate={validateName}
              />
              {errors.name && renderError(errors.name)}
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='description'>Description</FormLabel>
              <Field
                value={values.description}
                as={Textarea}
                name='description'
                id='description'
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='privacy'>Visibility</FormLabel>
              <Field
                as={Select}
                id='privacy'
                placeholder='Select organization privacy setting'
                name='privacy'
              >
                <option value='public'>Public</option>
                <option value='private'>Private</option>
              </Field>
              <FormHelperText>
                A private organization does not show its member list or team
                details to non-members.
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='teams_can_be_public'>
                Teams can be public
              </FormLabel>
              <Field
                as={Select}
                placeholder='Select team privacy setting'
                name='teams_can_be_public'
              >
                <option value='true'>Yes</option>
                <option value='false'>No</option>
              </Field>
              <FormHelperText>
                This overrides the organization teams visibility setting.
              </FormHelperText>
            </FormControl>
            <FormControl>
              <Button
                isDisabled={isSubmitting}
                onClick={() => {
                  if (Object.keys(errors).length) {
                    setErrors(errors)
                    return setStatus({
                      errors,
                    })
                  }
                  return submitForm()
                }}
                type='submit'
              >
                Submit
              </Button>
              {status && status.errors && renderErrors(status.errors)}
            </FormControl>
          </VStack>
        )
      }}
    />
  )
}
