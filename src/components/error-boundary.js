import { Box, Button, Container, Heading, Text } from '@chakra-ui/react'
import React from 'react'
import InpageHeader from './inpage-header'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false }
  }
  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI

    return { hasError: true }
  }
  componentDidCatch(error, errorInfo) {
    // You can use your own error logging service here
    // eslint-disable-next-line no-console
    console.error({ error, errorInfo })
  }
  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Box as='main' mb={8}>
          <InpageHeader>
            <Heading color='white' mb={2}>
              Application error
            </Heading>
          </InpageHeader>
          <Container maxW='container.xl' as='section'>
            <Box layerStyle={'shadowed'}>
              <Text fontSize='2xl'>
                Sorry, there was an error loading this page
              </Text>
              <Button onClick={() => this.setState({ hasError: false })}>
                Try again?
              </Button>
              <Text>
                Still having problems? Try logging out and back in or contacting
                a system administrator.
              </Text>
            </Box>
          </Container>
        </Box>
      )
    }

    // Return children components in case of no error

    return this.props.children
  }
}

export default ErrorBoundary
