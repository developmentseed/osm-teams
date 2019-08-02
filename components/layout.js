import React from 'react'
// import globalStyles from '../styles/global.js'
import theme from '../styles/theme'

function Layout (props) {
  return (
    <div className='page-layout'>
      {props.children}
      <style jsx global>
        {`
          html {
            box-sizing: border-box;
            font-size: ${theme.typography.rootFontSize};

            /* Changes the default tap highlight to be completely transparent in iOS. */
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          }

          *,
          *::before,
          *::after {
            box-sizing: inherit;
          }

          body {
            margin: 0;
            padding: 0;
            background: ${theme.colors.secondaryPale};
            color: ${theme.typography.baseFontColor};
            font-size: ${theme.typography.baseFontSize};
            line-height: ${theme.typography.baseLineHeight};
            font-family: ${theme.typography.baseFontFamily};
            font-weight: ${theme.typography.baseFontWeight};
            font-style: ${theme.typography.baseFontStyle};
            min-width: ${theme.layout.rowMinWidth};
          }

          .app-container {
            overflow: hidden;
          }

          .page-layout {
            display: grid;
            position: relative;
            grid-template-columns: 100%;
            grid-template-rows: 5rem 1fr 6rem;
            grid-template-areas:
              'header'
              'main'
              'footer';
            height: 100vh;
            overflow-x: hidden;
          }

          .inner {
            margin: 0 auto;
            max-width: ${theme.layout.rowMaxWidth};
            padding: 0 ${theme.layout.globalSpacing};
          }

          /* Links
           ========================================================================== */

          a {
            cursor: pointer;
            color: ${theme.colors.linkColor};
            text-decoration: none;
            transition: opacity 0.24s ease 0s;
          }

          a:visited {
            color: ${theme.colors.linkColor};
          }

          a:hover {
            opacity: 0.64;
          }

          a:active {
            transform: translate(0, 1px);
          }

          /* Thether element */
          .tether-element {
            z-index: 1000;
          }

          p {
            margin: 0 0 ${theme.layout.globalSpacing} 0;
          }

          ::selection {
            color: ${theme.colors.background};
            background-color: ${theme.colors.primaryColor};
          }

          .hidden {
            display: none;
          }
        `}
      </style>
    </div>
  )
}

export default Layout
