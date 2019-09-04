import React, { Fragment } from 'react'
import App, { Container } from 'next/app'
import Head from 'next/head'
import Sidebar from '../components/sidebar'
import Layout from '../components/layout.js'
import PageBanner from '../components/banner'
import Button from '../components/button'

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
    let bannerContent = <Fragment><span style={{ backgroundColor: '#FF6341', color: 'white', padding: '0.2rem' }}>beta</span> - please do not rely on the current API or site for production applications. All data will be deleted at the end of the beta. Provide your <a href='https://forms.gle/mQQX37FcvfVMoiCW7' style={{ borderBottom: 'solid 1px #384A9E' }}>feedback</a> here.</Fragment>
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
          <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Inconsolata:400,700|Work+Sans:400,700&display=swap' />
          <link rel='stylesheet' href='https://unpkg.com/leaflet@1.5.1/dist/leaflet.css'
            integrity='sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=='
            crossOrigin='' />
          <link rel='stylesheet' href='https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css' />
          <link rel='shortcut icon' href='/static/favicon.ico' />
          <link rel='icon' type='image/png' href='/static/favicon.png' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <meta charset='utf-8f-8' />
        </Head>
        { (bannerContent) ? <PageBanner content={bannerContent} variant='warning' /> : '' }
        <Layout>
          <Sidebar {...{ uid, picture, username }} />
          <Component {...Object.assign({ user: { uid, username, picture } }, pageProps)} />
        </Layout>
        <Button href='https://forms.gle/mQQX37FcvfVMoiCW7' variant='danger' id='feedback'>Feedback</Button>
      </Container>
    )
  }
}

export default OSMHydra
