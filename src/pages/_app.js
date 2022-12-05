import React from 'react'
import Head from 'next/head'
import Sidebar from '../components/sidebar'
import Layout from '../components/layout.js'
import Button from '../components/button'
import { ToastContainer } from 'react-toastify'
import { SessionProvider } from 'next-auth/react'
import join from 'url-join'

const BASE_PATH = process.env.BASE_PATH

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider
      session={session}
      basePath={`${join(BASE_PATH, '/api/auth')}`}
    >
      <Head>
        <title>OSM Teams</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta charSet='utf-8f-8' />
      </Head>
      <Layout>
        <Sidebar />
        <Component {...pageProps} />
        <Button
          href='https://forms.gle/mQQX37FcvfVMoiCW7'
          variant='danger'
          id='feedback'
        >
          Feedback
        </Button>
      </Layout>
      <ToastContainer position='bottom-right' />
    </SessionProvider>
  )
}
