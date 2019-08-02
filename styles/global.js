import css from 'styled-jsx/css'
import theme from '../styles/theme'

export default css`
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
    background: ${theme.colors.secondaryPale};
    color: ${theme.typography.baseFontColor};
    font-size: ${theme.typography.baseFontSize};
    line-height: ${theme.typography.baseLineHeight};
    /* stylelint-disable-next-line */
    font-family: ${theme.typography.baseFontFamily};
    font-weight: ${theme.typography.baseFontWeight};
    font-style: ${theme.typography.baseFontStyle};
    min-width: ${theme.layout.rowMinWidth};
  }

  .app-container {
    overflow: hidden;
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
    color: ${theme.colors.secondaryPale};
    background-color: ${theme.colors.primaryColor};
  }
`
