let colors = {
  baseColor: '#3D3D3D',
  primaryColor: '#384A9E',
  primaryLite: '#E8ECFF',
  primaryDark: '#1E2D72',
  secondaryColor: '#FF6341',
  secondaryLite: '#FFE4DE',
  secondaryDark: '#732C1D',
  backgroundColor: '#F6F6F6',

  dangerColor: '#d85d3f',
  successColor: '#216869',
  warningColor: '#ffc700',
  infoColor: '#5860ff'
}

colors = {
  ...colors,
  linkColor: colors.primaryColor,
  baseColorLight: '#E1E1E1'
  // baseAlphaColor: rgba(colors.baseColor, 0.08),
  // baseColorMed: tint(0.3, colors.baseColor),
  // primaryDark: shade(0.3, colors.primaryColor),
  // primaryLight: tint(0.7, colors.primaryColor),
  // secondaryMed: tint(0.5, colors.secondaryColor),
  // secondaryPale: tint(0.9, colors.secondaryColor)
}

let typography = {
  rootFontSize: '16px',
  baseFontColor: colors.baseColor,
  monoFontFamily: "'Inconsolata', monospace",
  baseFontFamily: "'Work Sans', sans-serif",
  baseFontStyle: 'normal',
  baseFontRegular: 400,
  baseFontBold: 700,
  baseFontWeight: 400,
  baseFontSize: '1rem',
  baseLineHeight: 1.5
}

typography = {
  ...typography,
  headingFontFamily: typography.monoFontFamily,
  headingFontRegular: 400,
  headingFontBold: 700,
  headingFontWeight: 700
}

let shape = {
  rounded: '0.25rem',
  ellipsoid: '320rem',
  borderWidth: '1px'
}

let layout = {
  globalSpacing: '1rem',
  rowMinWidth: '320px',
  rowMaxWidth: '1280px'
}

let mediaRanges = {
  xsmall: null,
  small: '544px',
  medium: '768px',
  large: '992px',
  xlarge: '1480px'
}

const theme = {
  layout,
  colors,
  typography,
  shape,
  mediaRanges
}

export default theme
