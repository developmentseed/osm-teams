import { Field, Form, Formik } from 'formik'
import Button from '../button'

const SearchInput = ({ onSearch, placeholder, 'data-cy': dataCy }) => (
  <Formik
    initialValues={{ search: '' }}
    onSubmit={({ search }) => onSearch(search)}
  >
    <Form className='form-control'>
      <Field
        data-cy={`${dataCy}-search-input`}
        type='text'
        name='search'
        id='search'
        placeholder={placeholder}
      />
      <Button
        data-cy={`${dataCy}-search-submit`}
        type='submit'
        variant='submit'
      >
        Search
      </Button>
    </Form>
  </Formik>
)

export default SearchInput
