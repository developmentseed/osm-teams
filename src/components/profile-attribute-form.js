import React from 'react'
import { Formik, Field, Form } from 'formik'
import { assoc } from 'ramda'
import { Button } from '@chakra-ui/react'
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
  key_type: 'text',
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
          <Form>
            <div className='form-control form-control__vertical'>
              <label htmlFor='name'>
                Name of attribute<span className='form--required'>*</span>
              </label>
              <Field
                type='text'
                name='name'
                id='name'
                placeholder='Favorite Color'
                value={values.name}
              />
              {errors.name ? (
                <div className='form--error'>{errors.name}</div>
              ) : null}
            </div>
            <div className='form-control form-control__vertical'>
              <label>Description of attribute:</label>
              <Field
                component='textarea'
                name='description'
                id='name'
                placeholder='Describe the attribute'
                value={values.description}
              />
            </div>
            <div className='form-control form-control__vertical'>
              <label>Visibility:</label>
              <Field
                as='select'
                type='text'
                name='visibility'
                id='visibility'
                value={values.visibility}
              >
                {typeOption}
                <option value='public'>Public</option>
              </Field>
            </div>
            <div className='form-control form-control__vertical'>
              <label>Type:</label>
              <Field
                as='select'
                type='text'
                name='key_type'
                id='key_type'
                value={values.key_type}
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
            </div>

            <div className='form-control'>
              <label>
                Is this attribute required?
                <Field
                  type='checkbox'
                  name='required'
                  id='required'
                  value='required'
                  checked={values.required.includes('required')}
                />
              </label>
            </div>
            {status && status.msg && <div>{status.msg}</div>}
            <div className='form-control form-control__vertical'>
              <Button type='submit' variant='submit' disabled={isSubmitting}>
                {addAttributeText}
              </Button>
            </div>
          </Form>
        )
      }}
    />
  )
}
