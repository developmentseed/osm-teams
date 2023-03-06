import { Flex, Text } from '@chakra-ui/react'
import React from 'react'

export default function PageBanner({ content, variant }) {
  return (
    <Flex
      alignItems={'center'}
      px={2}
      py={4}
      borderBottomWidth='4px'
      borderBottomColor={variant === 'warning' ? 'red.500' : 'brand.500'}
    >
      <Text size='xs' fontFamily={'mono'} textTransform='uppercase' m={0}>
        {content}
      </Text>
    </Flex>
  )
}
