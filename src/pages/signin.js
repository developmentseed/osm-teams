import { signIn, getProviders } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { Box, Container, Heading, Text, Button } from '@chakra-ui/react'
import InpageHeader from '../components/inpage-header'
import { authOptions } from './api/auth/[...nextauth]'

export default function SignIn() {
  return (
    <>
      <Box as='main' mb={8}>
        <InpageHeader>
          <Heading color='white' mb={2}>
            You are not signed in.
          </Heading>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          <Box layerStyle={'shadowed'}>
            <Text fontSize='2xl'>
              Sorry, you need to be signed in to view this page.
            </Text>
            <Button onClick={() => signIn('osm-teams')}>Sign in →</Button>
            <Text>Still having problems? Contact a system administrator.</Text>
          </Box>
        </Container>
      </Box>
    </>
  )
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: '/' } }
  }

  const providers = await getProviders()

  return {
    props: { providers: providers ?? [] },
  }
}
