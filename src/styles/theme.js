import { cssVar, extendTheme, withDefaultColorScheme } from '@chakra-ui/react'

export const formStyles = {
  parts: ['container', 'requiredIndicator', 'helperText'],
  baseStyle: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      alignItems: 'flex-start',
      width: 'initial',
      label: {
        fontSize: 'sm',
        fontWeight: 'bold',
      },
    },
  },
}

const theme = extendTheme(
  {
    styles: {
      global: {
        body: {
          bg: 'gray.100',
        },
        a: {
          fontFamily: `'Inconsolata', monospace`,
          _hover: {
            textDecoration: 'underline',
          },
        },
      },
    },
    layerStyles: {
      shadowed: {
        bg: 'white',
        border: '2px',
        borderColor: 'brand.700',
        p: 6,
        boxShadow: '4px 4px 0 0 var(--chakra-colors-brand-600)',
        overflow: 'hidden',
        mb: 8,
      },
    },
    radii: {
      md: '0', // heavy handed override for the border radius, rather than updating on every multipart component 🤷‍♂️
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '1.75rem',
      '3xl': '2rem',
      '4xl': '2.25rem',
      '5xl': '2.5rem',
      '6xl': '2.75rem',
      '7xl': '3rem',
      '8xl': '3.25rem',
      '9xl': '3.5rem',
    },
    fonts: {
      body: `'Work Sans', sans-serif`,
      heading: `'Work Sans', sans-serif`,
      mono: `'Inconsolata', monospace`,
    },
    colors: {
      gray: {
        800: '#443F3F', // Text color
      },
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
      red: {
        50: '#FFEAE5',
        100: '#FFC4B8',
        200: '#FF9F8A',
        300: '#FF795C',
        400: '#FF532E',
        500: '#FF2E00',
        600: '#CC2500',
        700: '#991B00',
        800: '#661200',
        900: '#330900',
      },
    },
    components: {
      Form: formStyles,
      Heading: {
        baseStyle: {
          color: 'brand.600',
        },
        sizes: {
          xs: {
            lineHeight: 'calc(0.5rem + 1em)',
          },
          sm: {
            lineHeight: 'calc(0.5rem + 1em)',
          },
          md: {
            lineHeight: 'calc(0.5rem + 1em)',
          },
          lg: {
            lineHeight: 'calc(0.5rem + 1em)',
          },
          xl: {
            lineHeight: 'calc(0.5rem + 1em)',
          },
          '2xl': {
            lineHeight: 'calc(0.5rem + 1em)',
          },
          '3xl': {
            lineHeight: 'calc(0.5rem + 1em)',
          },
          '4xl': {
            lineHeight: 'calc(0.5rem + 1em)',
          },
        },
        variants: {
          sectionHead: {
            colorScheme: 'brand',
            fontFamily: 'mono',
            fontSize: 'lg',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            mb: 1,
          },
        },
      },
      Button: {
        baseStyle: {
          fontFamily: 'mono',
          fontWeight: 'bold',
          _hover: {
            textDecoration: 'none',
          },
        },
        defaultProps: {
          size: 'md',
          variant: 'solid',
        },
      },
      Card: {
        sizes: {
          md: {
            container: {
              [cssVar('card-padding').variable]: ['space.4', null, 'space.8'],
            },
          },
        },
      },
    },
  },
  withDefaultColorScheme({
    colorScheme: 'brand',
    components: ['Button', 'Heading'],
  })
)

export default theme
