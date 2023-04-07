import { Html, Head, Main, NextScript } from 'next/document'
import join from 'url-join'
const APP_URL = process.env.APP_URL

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css?family=Inconsolata:400,700|Work+Sans:400,600,700&display=optional'
        />
        <link
          rel='stylesheet'
          href='https://unpkg.com/leaflet@1.5.1/dist/leaflet.css'
          integrity='sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=='
          crossOrigin='anonymous'
        />
        <link
          rel='stylesheet'
          href='https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css'
        />
        <link
          rel='stylesheet'
          href='https://unpkg.com/react-toastify@8.2.0/dist/ReactToastify.min.css'
        />
        <link rel='shortcut icon' href={join(APP_URL, '/static/favicon.ico')} />
        <link
          rel='icon'
          type='image/png'
          href={join(APP_URL, '/static/favicon.png')}
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href={join(APP_URL, '/static/apple-touch-icon.png')}
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href={join(APP_URL, '/static/favicon-32x32.png')}
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href={join(APP_URL, '/static/favicon-16x16.png')}
        />
        <link rel='manifest' href={join(APP_URL, '/static/site.webmanifest')} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
