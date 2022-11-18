import { createSwaggerSpec } from 'next-swagger-doc'
import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'
import nextSwaggerDocSpec from '../../../next-swagger-doc.json'

const SwaggerUI = dynamic(import('swagger-ui-react'), { ssr: false })

function ApiDoc({ spec }) {
  return <SwaggerUI spec={spec} />
}

export const getStaticProps = async () => {
  const spec = createSwaggerSpec(nextSwaggerDocSpec)

  return {
    props: {
      spec,
    },
  }
}

export default ApiDoc
