import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import '@fontsource/work-sans/400.css'
import '@fontsource/work-sans/700.css'
import '@fontsource/inconsolata/400.css'
import '@fontsource/inconsolata/700.css'

import Head from 'next/head'
import Layout from '../components/layout.js'
import { ToastContainer } from 'react-toastify'
import { SessionProvider } from 'next-auth/react'
import join from 'url-join'
import theme from '../styles/theme'
import PageHeader from '../components/page-header'

const APP_URL = process.env.APP_URL

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <ChakraProvider theme={theme}>
      <SessionProvider
        session={session}
        basePath={`${join(APP_URL, '/api/auth')}`}
      >
        <Head>
          <title>OSM Teams</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <meta charSet='utf-8f-8' />
        </Head>
        <Layout>
          <PageHeader />
          <Component {...pageProps} />
        </Layout>
        <ToastContainer position='bottom-right' />
      </SessionProvider>
    </ChakraProvider>
  )
}
