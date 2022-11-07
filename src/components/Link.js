import { withRouter } from 'next/router'
import Link from 'next/link'
import React, { Children } from 'react'
import join from 'url-join'
import parse from 'url-parse'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const URL = publicRuntimeConfig.APP_URL

const ActiveLink = ({ router, children, ...props }) => {
  const { href, as } = props
  const hrefPathname = parse(href).pathname
  const routerPathname = parse(router.asPath).pathname
  const newHref = join(URL, href)
  let newAs
  if (as) {
    newAs = join(URL, as)
  }

  const child = Children.only(children)

  let className = child.props.className || null
  if (routerPathname === hrefPathname && props.activeClassName) {
    className = `${className !== null ? className : ''} ${
      props.activeClassName
    }`.trim()
  }

  delete props.activeClassName

  return (
    <Link legacyBehavior {...props} href={newHref} as={newAs}>
      {React.cloneElement(child, { className })}
    </Link>
  )
}

export default withRouter(ActiveLink)
