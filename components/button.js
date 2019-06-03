import React from 'react'
import getConfig from 'next/config'
import join from 'url-join'
const { publicRuntimeConfig } = getConfig()

export default function Button ({href, onClick, children, danger, small}) { 
  let color = 'dark-green'
  let size = "bw2 ph3 pv2 mb2"
  if (danger) {
    color = 'near-black'
  }
  if (small) {
    size = "bw1 ph2 pv1 mb1"
  }

  const commonStyle = `${color} ${size} f6 link dim br1 ba dib pointer`
  if (href) {
    const fullUrl = join(publicRuntimeConfig.APP_URL, href)
    return <a href={fullUrl} className={`link ${commonStyle}`}>{children}</a>
  }
  return <div onClick={onClick} className={commonStyle}>{children}</div>
}