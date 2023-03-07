import { useEffect, useRef } from 'react'
import { Field, Form, Formik, useFormikContext } from 'formik'
import { Button } from '@chakra-ui/react'

/**
 * This is a helper component to auto-submit search values after a timeout
 */
const AutoSubmitSearch = () => {
  const timerRef = useRef(null)

  const { values, touched, submitForm } = useFormikContext()

  useEffect(() => {
    // Check if input was touched. Formik behavior is to update 'touched'
    // flag on input blur or submit, but we want to submit changes also on
    // key press. 'touched' is not a useEffect dependency because it is
    // constantly updated without value changes.
    const isTouched = touched.search || values?.search.length > 0

    // If search is touched
    if (isTouched) {
      // Clear previous timeout, if exists
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      // Define new timeout
      timerRef.current = setTimeout(submitForm, 1000)
    }

    // Clear timeout on unmount
    return () => timerRef.current && clearTimeout(timerRef.current)
  }, [values])

  return null
}

/**
 * The search input
 */
const SearchInput = ({ onSearch, placeholder, 'data-cy': dataCy }) => {
  return (
    <Formik
      initialValues={{ search: '' }}
      onSubmit={({ search }) => onSearch(search)}
    >
      <Form
        className='form-control justify-start'
        style={{ alignItems: 'stretch' }}
      >
        <Field
          data-cy={`${dataCy}-search-input`}
          type='search'
          name='search'
          id='search'
          placeholder={placeholder}
          style={{ width: '14rem' }}
        />
        <Button
          data-cy={`${dataCy}-search-submit`}
          type='submit'
          variant='solid'
          useIcon='magnifier-left'
          flat
        />
        <AutoSubmitSearch />
      </Form>
    </Formik>
  )
}

export default SearchInput
