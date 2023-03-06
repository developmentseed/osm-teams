import { Link as ChakraLink } from '@chakra-ui/react'
import { Link as NextLink } from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

function NavLink({ href, activeProps, children, ...props }) {
  const router = useRouter()
  const isActive = router.pathname === href

  if (isActive) {
    return (
      <ChakraLink as={NextLink} href={href} {...props} {...activeProps}>
        {children}
      </ChakraLink>
    )
  }

  return (
    <ChakraLink as={NextLink} href={href} {...props}>
      {children}
    </ChakraLink>
  )
}

export default NavLink
