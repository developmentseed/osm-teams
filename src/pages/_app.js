import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import '@fontsource/work-sans/400.css'
import '@fontsource/work-sans/700.css'
import '@fontsource/inconsolata/400.css'
import '@fontsource/inconsolata/700.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'

import Head from 'next/head'
import { Box } from '@chakra-ui/react'
import { ToastContainer } from 'react-toastify'
import { SessionProvider } from 'next-auth/react'

import theme from '../styles/theme'
import PageHeader from '../components/page-header'
import ErrorBoundary from '../components/error-boundary'
const BASE_PATH = process.env.BASE_PATH || ''

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <ChakraProvider theme={theme}>
      <SessionProvider session={session} basePath={`${BASE_PATH}/api/auth`}>
        <Head>
          <title>OSM Teams</title>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <meta charSet='utf-8f-8' />
        </Head>
        <Box
          display='grid'
          position='relative'
          gridTemplateRows={'4rem 1fr'}
          minHeight='100vh'
          margin='0'
          padding='0'
        >
          <PageHeader />
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
        </Box>
        <ToastContainer position='bottom-right' />
      </SessionProvider>
    </ChakraProvider>
  )
}
