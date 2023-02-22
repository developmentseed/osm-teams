import React from 'react'
import {
  ChakraProvider,
  withDefaultColorScheme,
  extendTheme,
} from '@chakra-ui/react'

import Head from 'next/head'
import Sidebar from '../components/sidebar'
import Layout from '../components/layout.js'
import { ToastContainer } from 'react-toastify'
import { SessionProvider } from 'next-auth/react'
import join from 'url-join'

const APP_URL = process.env.APP_URL
const colors = {
  brand: {
    50: '#ECEEF8',
    100: '#CAD0EC',
    200: '#A8B2E0',
    300: '#8794D4',
    400: '#6576C8',
    500: '#4358BC',
    600: '#354797',
    700: '#283571',
    800: '#1B234B',
    900: '#0D1226',
  },
}

const components = {
  Button: {
    variants: {
      solid: {
        borderRadius: 0,
        textTransform: 'uppercase',
        _hover: {
          bg: 'brand.600',
          color: '#FFFFFF',
        },
      },
    },
  },
}

const theme = extendTheme(
  { colors, components },
  withDefaultColorScheme({ colorScheme: 'brand' })
)

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
          <Sidebar />
          <Component {...pageProps} />
        </Layout>
        <ToastContainer position='bottom-right' />
      </SessionProvider>
    </ChakraProvider>
  )
}
