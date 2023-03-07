import { Box, Heading } from '@chakra-ui/react'
import React, { Component } from 'react'

export default class UhOh extends Component {
  render() {
    return (
      <Box as='main' mb={16}>
        <Heading fontFamily='mono'>Page not found</Heading>
        <div>Sorry, the page you are looking for is not available.</div>
        <br />
        <div>
          Still having problems? Try logging out and back in or contacting a
          system administrator.
        </div>
      </Box>
    )
  }
}
