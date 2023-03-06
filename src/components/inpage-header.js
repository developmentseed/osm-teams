import { Container, Box } from '@chakra-ui/react'

export default function InpageHeader({ children }) {
  return (
    <Box
      as='section'
      bg='linear-gradient(90deg, var(--chakra-colors-brand-700) 31px, transparent 1%) center, linear-gradient(var(--chakra-colors-brand-700) 31px, transparent 1%) center, #ffffff'
      bgSize='32px 32px'
      color='white'
      pt={12}
      pb={24}
      mb={-12}
    >
      <Container maxW='container.xl'>{children}</Container>
    </Box>
  )
}
