import { withRouter } from 'next/router'
import Link from 'next/link'
import React, { Children } from 'react'
import parse from 'url-parse'

const NavLink = withRouter(({ children, href }) => {
  return (
    <ActiveLink href={href} activeClassName='active'>
      {children}
    </ActiveLink>
  )
})

const ActiveLink = withRouter(({ router, children, ...props }) => {
  const { href, as } = props
  const hrefPathname = parse(href).pathname
  const routerPathname = parse(router.asPath).pathname

  const child = Children.only(children)

  let className = child.props.className || null
  if (routerPathname === hrefPathname && props.activeClassName) {
    className = `${className !== null ? className : ''} ${
      props.activeClassName
    }`.trim()
  }

  delete props.activeClassName

  return (
    <Link {...props} href={href} as={as}>
      {React.cloneElement(child, { className })}
    </Link>
  )
})

export default NavLink
