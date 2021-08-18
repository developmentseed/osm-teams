import React from 'react'
import { Formik, Field, Form } from 'formik'
import { assoc } from 'ramda'
import Button from './button'

const validate = values => {
  const errors = {}
  if (!values.name || values.name.length < 1) {
    errors.name = 'Required'
  }
  return errors
}

const defaultValues = {
  name: '',
  visibility: 'team',
  description: '',
  required: []
}

export default function ProfileAttributeForm ({ onSubmit, initialValues = defaultValues }) {
  return (
    <Formik
      validate={validate}
      initialValues={initialValues}
      onSubmit={async (values, actions) => {
        actions.setSubmitting(true)

        let data = assoc('required', (values.required.includes('required')), values)
        try {
          await onSubmit(data)
          actions.setSubmitting(false)
          actions.resetForm(initialValues)
        } catch (e) {
          console.error(e)
          actions.setSubmitting(false)
          actions.setStatus(e.message)
        }
      }}
      render={({ errors, status, isSubmitting, values }) => {
        const addAttributeText = `Submit ${isSubmitting ? ' 🕙' : ''}`

        return (
          <Form>
            <div className='form-control form-control__vertical'>
              <label htmlFor='name'>Name of attribute<span className='form--required'>*</span></label>
              <Field
                type='text'
                name='name'
                id='name'
                placeholder='Favorite Color'
                value={values.name}
              />
              {errors.name ? <div className='form--error'>{errors.name}</div> : null}
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
                <option value='team'>Team</option>
                <option value='public'>Public</option>
              </Field>
            </div>

            <div className='form-control'>
              <label>Is this attribute required?
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
