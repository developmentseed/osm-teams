import React, { Component } from 'react'
import { Box, Container, Heading, Text } from '@chakra-ui/react'
import InpageHeader from '../components/inpage-header'

export default class UhOh extends Component {
  render() {
    return (
      <Box as='main' mb={8}>
        <InpageHeader>
          <Heading color='white' mb={2}>
            Page Not Found
          </Heading>
        </InpageHeader>
        <Container maxW='container.xl' as='section'>
          <Box layerStyle={'shadowed'}>
            <Text fontSize='2xl'>
              Sorry, the page you are looking for is not available.
            </Text>
            <Text>
              Still having problems? Try logging out and back in or contacting a
              system administrator.
            </Text>
          </Box>
        </Container>
      </Box>
    )
  }
}
