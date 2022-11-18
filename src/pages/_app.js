import React from 'react'
import Head from 'next/head'
import Sidebar from '../components/sidebar'
import Layout from '../components/layout.js'
import Button from '../components/button'
import { ToastContainer } from 'react-toastify'
import { SessionProvider } from 'next-auth/react'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>OSM Teams</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta charSet='utf-8f-8' />
      </Head>
      <Layout>
        <Sidebar />
        <Component {...pageProps} />
      </Layout>
      <Button
        href='https://forms.gle/mQQX37FcvfVMoiCW7'
        variant='danger'
        id='feedback'
      >
        Feedback
      </Button>
      <ToastContainer position='bottom-right' />
    </SessionProvider>
  )
}
