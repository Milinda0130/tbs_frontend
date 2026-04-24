import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'on-primary': 'var(--on-primary)',
        'primary-container': 'var(--primary-container)',
        'on-primary-container': 'var(--on-primary-container)',
        'primary-fixed': 'var(--primary-fixed)',
        'on-primary-fixed': 'var(--on-primary-fixed)',
        'primary-fixed-dim': 'var(--primary-fixed-dim)',
        'on-primary-fixed-variant': 'var(--on-primary-fixed-variant)',
        secondary: 'var(--secondary)',
        'on-secondary': 'var(--on-secondary)',
        'secondary-container': 'var(--secondary-container)',
        'on-secondary-container': 'var(--on-secondary-container)',
        'secondary-fixed': 'var(--secondary-fixed)',
        'on-secondary-fixed': 'var(--on-secondary-fixed)',
        'secondary-fixed-dim': 'var(--secondary-fixed-dim)',
        'on-secondary-fixed-variant': 'var(--on-secondary-fixed-variant)',
        tertiary: 'var(--tertiary)',
        'on-tertiary': 'var(--on-tertiary)',
        'tertiary-container': 'var(--tertiary-container)',
        'on-tertiary-container': 'var(--on-tertiary-container)',
        'tertiary-fixed': 'var(--tertiary-fixed)',
        'on-tertiary-fixed': 'var(--on-tertiary-fixed)',
        'tertiary-fixed-dim': 'var(--tertiary-fixed-dim)',
        'on-tertiary-fixed-variant': 'var(--on-tertiary-fixed-variant)',
        error: 'var(--error)',
        'on-error': 'var(--on-error)',
        'error-container': 'var(--error-container)',
        'on-error-container': 'var(--on-error-container)',
        background: 'var(--background)',
        'on-background': 'var(--on-background)',
        surface: 'var(--surface)',
        'on-surface': 'var(--on-surface)',
        'surface-variant': 'var(--surface-variant)',
        'on-surface-variant': 'var(--on-surface-variant)',
        'surface-bright': 'var(--surface-bright)',
        'surface-dim': 'var(--surface-dim)',
        'surface-container-lowest': 'var(--surface-container-lowest)',
        'surface-container-low': 'var(--surface-container-low)',
        'surface-container': 'var(--surface-container)',
        'surface-container-high': 'var(--surface-container-high)',
        'surface-container-highest': 'var(--surface-container-highest)',
        'surface-tint': 'var(--surface-tint)',
        'inverse-surface': 'var(--inverse-surface)',
        'inverse-on-surface': 'var(--inverse-on-surface)',
        'inverse-primary': 'var(--inverse-primary)',
        outline: 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',
        foreground: 'var(--foreground)',
      },
      spacing: {
        xl: "48px",
        gutter: "24px",
        lg: "32px",
        "container-max": "1440px",
        sm: "16px",
        md: "24px",
        xs: "8px",
        base: "4px"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      fontFamily: {
        sans: ['"Public Sans"', 'sans-serif'],
      },
      animation: {
        'fade-in':   'fadeIn 0.2s ease-in-out',
        'slide-in':  'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: { '0%': { transform: 'translateX(-10px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.text-headline-lg': {
          fontSize: '32px',
          fontWeight: '700',
        },
        '.text-headline-md': {
          fontSize: '24px',
          fontWeight: '700',
        },
        '.text-headline-sm': {
          fontSize: '20px',
          fontWeight: '600',
        },
        '.text-body-lg': {
          fontSize: '16px',
          fontWeight: '400',
        },
        '.text-body-md': {
          fontSize: '14px',
          fontWeight: '400',
        },
        '.text-label-bold': {
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '0.05em',
        },
        '.text-label-md': {
          fontSize: '12px',
          fontWeight: '600',
        },
      })
    })
  ],
}
