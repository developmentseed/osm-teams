import React from 'react'
import css from 'styled-jsx/css'
import theme from '../styles/theme'

export const globalStyles = css.global`
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
    grid-template-rows: 4rem 1fr;
    grid-template-columns: 100%;
    grid-template-areas:
      'sidebar'
      'main'
      'footer';
    height: 100vh;
    overflow: overlay;
  }

  @media screen and (min-width: ${theme.mediaRanges.small}) {
    .page-layout {
      grid-template-columns: 4rem 1fr;
      grid-template-rows: 1fr;
      grid-template-areas: 'sidebar main';
    }
  }

  @media screen and (min-width: ${theme.mediaRanges.large}) {
    .page-layout {
      grid-template-columns: 14rem 1fr;
    }
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

  .inner.page section {
    margin-bottom: calc(${theme.layout.globalSpacing} * 2);
  }

  .page__heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${theme.layout.globalSpacing};
  }

  .section-actions {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: ${theme.layout.globalSpacing};
  }

  @media (min-width: ${theme.mediaRanges.medium}) {
    .page__heading {
      flex-direction: row;
      align-items: center;
    }
    .section-actions {
      flex-direction: row;
      align-items: center;
    }
  }

  .alert {
    background: white;
    padding: 2em;
    margin-bottom: 1rem;
    box-shadow: 4px 4px 0 ${theme.colors.warningColor};
  }

  /* Typography
           ========================================================================== */

  h1,
  h2,
  h3 {
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

  a.danger {
    color: ${theme.colors.secondaryColor};
  }

  /* Forms
           ========================================================================== */
  input,
  label,
  select,
  button,
  textarea {
    font-size: 1rem;
    font-family: ${theme.typography.baseFontFamily};
  }

  .form-control {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-control__vertical {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-control :global(label) {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .form-control :global(input),
  .form-control :global(textarea) {
    min-width: 6rem;
    padding: 0.5rem 1rem 0.5rem 0.25rem;
    margin-right: 1rem;
    border: 2px solid ${theme.colors.primaryColor};
  }

  .form-control :global(input[type='color']) {
    padding: 3px;
    height: 2.5rem;
  }

  .status--alert {
    font-size: 0.875rem;
    color: ${theme.colors.secondaryColor};
    background-color: ${theme.colors.secondaryLite};
    font-family: ${theme.typography.headingFontFamily};
    padding: 1rem;
    margin: 1rem 0 2rem;
  }

  .form--required {
    color: ${theme.colors.secondaryColor};
    font-size: 0.875rem;
    font-family: ${theme.typography.headingFontFamily};
  }

  .form--error {
    color: ${theme.colors.secondaryColor};
  }

  /* Tether element */
  .tether-element {
    z-index: 1000;
  }

  .hidden {
    display: none;
  }

  img {
    max-width: 100%;
  }

  #feedback {
    position: fixed;
    right: -3.5rem;
    bottom: 12rem;
    z-index: 1200;
    transform: rotate(-90deg);
    background: ${theme.colors.secondaryColor};
    color: white;
    overflow: hidden;
  }
  #feedback:hover {
    opacity: 1;
    background: #e04d2d;
  }
`
function Layout(props) {
  return (
    <div className='page-layout'>
      {props.children}
      <style jsx global>
        {globalStyles}
      </style>
    </div>
  )
}

export default Layout
