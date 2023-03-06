import { withRouter } from 'next/router'
import Link from 'next/link'
import React, { Children } from 'react'
import parse from 'url-parse'

const NavLink = withRouter(({ children, href, passHref, legacyBehavior }) => {
  return (
    <ActiveLink
      href={href}
      passHref={passHref}
      legacyBehavior={legacyBehavior}
      activeClassName='active'
    >
      {children}
    </ActiveLink>
  )
})

const ActiveLink = withRouter(({ router, children, ...props }) => {
  const { href, as, passHref, legacyBehavior } = props
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
    <Link
      {...props}
      href={href}
      passHref={passHref}
      as={as}
      legacyBehavior={legacyBehavior}
      className={className}
    >
      {React.cloneElement(child, { className })}
    </Link>
  )
})

export default NavLink
