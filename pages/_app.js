import React from 'react'
import App, { Container } from 'next/app'
import Head from 'next/head'
import Header from '../components/header'

class OSMHydra extends App {
  static async getInitialProps ({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    let userData = { }
    if (ctx.req && ctx.req.session) {
      userData.uid = ctx.req.session.user_id
      userData.username = ctx.req.session.user
      userData.picture = ctx.req.session.user_picture
    }

    return { pageProps, userData }
  }

  render () {
    const { Component, pageProps, userData } = this.props

    let { uid, username, picture } = userData

    // store the userdata in localstorage if in browser
    let authed
    if (typeof window !== 'undefined') {
      authed = window.sessionStorage.getItem('authed')
      if (userData && userData.uid && authed === null) {
        window.sessionStorage.setItem('uid', userData.uid)
        window.sessionStorage.setItem('username', userData.username)
        window.sessionStorage.setItem('picture', userData.picture)
        window.sessionStorage.setItem('authed', true)
      }
      if (authed) {
        uid = window.sessionStorage.getItem('uid')
        username = window.sessionStorage.getItem('username')
        picture = window.sessionStorage.getItem('picture')
      }
    }

    return (
      <Container>
        <Head>
          <title>OSM Teams</title>
          <link rel='stylesheet' href='https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css' />
          <link rel='shortcut icon' href='/static/favicon.ico' />
          <link rel='icon' type='image/png' href='/static/favicon.png' />
          <style>{`body { margin: 0; background: #F4F4F4; color: #111 }`}</style>
        </Head>
        <article className='code mw6 pa3 ma5 center bg-white ba bw2'>
          {uid ? <Header {...{ uid, picture, username }} /> : <div />}
          <Component {...Object.assign({ user: { uid, username, picture } }, pageProps)} />
        </article>
      </Container>
    )
  }
}

export default OSMHydra
