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
            background: ${theme.colors.backgroundColor};
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
            width: 100%;
            max-width: ${theme.layout.rowMaxWidth};
            padding: 0 ${theme.layout.globalSpacing};
          }

          .inner.page {
            grid-area: main;
            margin-top: calc(${theme.layout.globalSpacing} * 4);
            margin-bottom: calc(${theme.layout.globalSpacing} * 4);
          }

          .page__heading {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: ${theme.layout.globalSpacing};
          }

          .section-actions {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            margin-bottom: calc(${theme.layout.globalSpacing} * 2);
          }

          @media (min-width: ${theme.mediaRanges.medium}) {
            .page__heading {
              flex-direction: row;
              align-items: center;
            }
            .section-actions {
              flex-direction: row;
            }
          }

          /* Typography
           ========================================================================== */

           h1, h2, h3 {
             font-family: ${theme.typography.headingFontFamily};
             font-weight: ${theme.typography.baseFontWeight};
             color: ${theme.colors.primaryColor};
             margin-top: 0;
             margin-bottom: 0;
           }

           h1 {
             font-size: 2.827rem;
           }

           h2 {
             font-size: 1.999rem;
           }

           h3 {
             font-size: 1.414rem;
           }

           p {
             margin: 0 0 ${theme.layout.globalSpacing} 0;
           }

           ::selection {
             color: ${theme.colors.backgroundColor};
             background-color: ${theme.colors.primaryColor};
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

          /* Forms
           ========================================================================== */

          .form-control {
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
          }

          .form-control :global(label) {
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }

          .form-control :global(input) {
            min-width: 6rem;
            padding: 0.5rem 1rem 0.5rem 0.25rem;
            margin-right: 1rem;
          }

          /* Tether element */
          .tether-element {
            z-index: 1000;
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
