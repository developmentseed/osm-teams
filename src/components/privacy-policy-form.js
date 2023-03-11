import React from 'react'
import { Formik, Field, Form } from 'formik'
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Textarea,
  VStack,
} from '@chakra-ui/react'

function validateBody(value) {
  if (!value) return 'Body of privacy policy is required'
}

function validateConsentText(value) {
  if (!value) return 'Consent Text of privacy policy is required'
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

export default function PrivacyPolicyForm({ initialValues, onSubmit }) {
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
            <FormControl>
              <FormLabel isRequired isInvalid={errors.body}>
                Body
              </FormLabel>
              <Field
                cols={40}
                rows={6}
                as={Textarea}
                name='body'
                id='body'
                value={values.body}
                required
                className={errors.body ? 'form-error' : ''}
                validate={validateBody}
              />
            </FormControl>
            <FormControl isRequired isInvalid={errors.consentText}>
              <FormLabel>Consent Text</FormLabel>
              <Field
                cols={40}
                rows={6}
                as={Textarea}
                name='consentText'
                id='consentText'
                value={values.consentText}
                required
                className={errors.consentText ? 'form-error' : ''}
                validate={validateConsentText}
              />
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
