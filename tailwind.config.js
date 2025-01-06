/** @type {import('tailwindcss').Config} */
function withOpacityValue(variable) {
  return ({opacityValue}) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: withOpacityValue('--color-primary'),
        contrast: withOpacityValue('--color-contrast'),
        notice: withOpacityValue('--color-accent'),
        shopPay: 'var(--color-shop-pay)',
        // brand
        brand: '#446039',
        'brand-hover': '#2D4026',
        'link-underline': 'rgba(68, 96, 57, 0.4)',
        // primary colors
        // empowering evergreen
        'primary-green': '#24331E',
        // energizing lime
        'primary-lime': '#A9C23D',
        // secondary colors
        'lime-90': '#EEF3D8',
        'lime-70': '#CCDA8B',
        'green-50': '#71A05E',
        'green-30': '#446039',
        // neutral
        'neutral-8': '#160E1B',
        'neutral-12': '#211528',
        'neutral-16': '#2B2131',
        'neutral-24': '#3E3A41',
        'neutral-32': '#534D56',
        'neutral-44': '#726B76',
        'neutral-72': '#B8B5BA',
        'neutral-80': '#CDCACE',
        'neutral-88': '#E1DFE2',
        'neutral-92': '#EBE7ED',
        'neutral-96': '#F6F3F7',
        'neutral-98': '#FAF8FB',
        // semantic
        error: '#AD0322',
        warning: '#FAA614',
        success: '#667425',
        info: '#006BB2',
        autofill: '#E3EEF5',
        // hero section
        'hero-transparent': 'rgba(22, 14, 27, 0.88)',
      },
      screens: {
        sm: '32em',
        md: '48em',
        lg: '64em',
        xl: '80em',
        '2xl': '96em',
        'sm-max': {max: '48em'},
        'sm-only': {min: '32em', max: '48em'},
        'md-only': {min: '48em', max: '64em'},
        'lg-only': {min: '64em', max: '80em'},
        'xl-only': {min: '80em', max: '96em'},
        '2xl-only': {min: '96em'},
      },
      spacing: {
        nav: 'var(--height-nav)',
        screen: 'var(--screen-height, 100vh)',
      },
      height: {
        screen: 'var(--screen-height, 100vh)',
        'screen-no-nav':
          'calc(var(--screen-height, 100vh) - var(--height-nav))',
        'screen-dynamic': 'var(--screen-height-dynamic, 100vh)',
      },
      width: {
        mobileGallery: 'calc(100vw - 3rem)',
      },
      fontFamily: {
        sans: [
          'Albert Sans',
          'Helvetica Neue',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        serif: ['"IBMPlexSerif"', 'Palatino', 'ui-serif'],
      },
      fontSize: {
        display: ['var(--font-size-display)', '1.1'],
        heading: ['var(--font-size-heading)', '1.25'],
        lead: ['var(--font-size-lead)', '1.333'],
        copy: ['var(--font-size-copy)', '1.5'],
        fine: ['var(--font-size-fine)', '1.333'],
      },
      maxWidth: {
        'prose-narrow': '45ch',
        'prose-wide': '80ch',
      },
      boxShadow: {
        border: 'inset 0px 0px 0px 1px rgb(var(--color-primary) / 0.08)',
        darkHeader: 'inset 0px -1px 0px 0px rgba(21, 21, 21, 0.4)',
        lightHeader: 'inset 0px -1px 0px 0px rgba(21, 21, 21, 0.05)',
        insetBrand: 'inset 0px -2px #446039',
        navDropdown: '0px 4px 8px 0px rgba(0, 0, 0, 0.04)',
        dropShadow: '0px 0px 8px 0px rgba(10, 10, 10, 0.12);',
      },
      keyframes: {
        slideDown: {
          '0%': {top: '-100%'},
          '100%': {top: '0'},
        },
        slideUp: {
          '0%': {top: '0'},
          '100%': {top: '-100%'},
        },
},
      backgroundColor: {
      'commonbg':'#faf8fb',


      },
      animation: {
        slideDown: 'slideDown .75s ease-out forwards',
        slideUp: 'slideUp .75s ease-out forwards',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
