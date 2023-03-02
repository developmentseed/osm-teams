import { Container, Box } from '@chakra-ui/react'

export default function InpageHeader({ children }) {
  return (
    <Box as='section' bg='brand.700' color='white' pt={12} pb={24} mb={-12}>
      <Container maxW='container.xl'>{children}</Container>
    </Box>
  )
}
