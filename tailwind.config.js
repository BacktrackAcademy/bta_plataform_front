import typography from '@tailwindcss/typography'

const animate = require('tailwindcss-animate')

// hsl(var(--x) / <alpha-value>) → soporta bg-primary/10 y demás modificadores de opacidad
function token(name) {
  return `hsl(var(--${name}) / <alpha-value>)`
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  safelist: ['dark'],
  prefix: '',

  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      backgroundImage: {
        'bta-hero': 'url(\'/banner/banner_pink.png\')',
      },
      fontFamily: {
        oswald: ['Oswald', 'helvetica neue', 'Helvetica', 'Arial', 'sans-serif'],
        inconsolata: ['Inconsolata', 'monospace'],
        mono: ['Inconsolata', 'ui-monospace', 'monospace'],
        sans: ['IBM Plex Sans', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      scale: {
        40: '0.4',
        80: '0.8',
      },
      colors: {
        // ---- Tokens semánticos (valores en assets/css/tailwind.css) ----
        'background': token('background'),
        'foreground': {
          DEFAULT: token('foreground'),
          secondary: token('foreground-secondary'),
          muted: token('foreground-muted'),
          subtle: token('foreground-subtle'),
        },
        // L1 sidebar/topbar/inputs · L2 cards · L3 popovers/hover · L4 selected
        'surface': {
          1: token('surface-1'),
          2: token('surface-2'),
          3: token('surface-3'),
          4: token('surface-4'),
        },
        'border': {
          DEFAULT: token('border'),
          subtle: token('border-subtle'),
          strong: token('border-strong'),
        },
        'input': token('input'),
        'ring': token('focus-ring'),
        'primary': {
          DEFAULT: token('primary'),
          hover: token('primary-hover'),
          active: token('primary-active'),
          foreground: token('primary-foreground'),
          subtle: token('primary-subtle'),
          text: token('primary-text'),
        },
        'success': token('success'),
        'warning': token('warning'),
        'danger': token('danger'),
        'info': token('info'),
        'scrim': token('scrim'),
        // ---- Compatibilidad shadcn-vue (components/ui) ----
        'secondary': { DEFAULT: token('secondary'), foreground: token('secondary-foreground') },
        'destructive': { DEFAULT: token('destructive'), foreground: token('destructive-foreground') },
        'muted': { DEFAULT: token('muted'), foreground: token('muted-foreground') },
        'accent': { DEFAULT: token('accent'), foreground: token('accent-foreground') },
        'popover': { DEFAULT: token('popover'), foreground: token('popover-foreground') },
        'card': { DEFAULT: token('card'), foreground: token('card-foreground') },
      },
      // `border-subtle` / `border-strong` además de `border-border-subtle`
      borderColor: {
        subtle: token('border-subtle'),
        strong: token('border-strong'),
      },
      boxShadow: {
        'elev-1': 'var(--shadow-1)',
        'elev-2': 'var(--shadow-2)',
        'elev-3': 'var(--shadow-3)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
      },
      // Radius pequeño y técnico: nada supera 8px aunque el código use rounded-xl/2xl
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-lg)',
        '2xl': 'var(--radius-lg)',
      },
      keyframes: {
        'rise-in': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'collapsible-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'rise-in': 'rise-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-in-out',
        'collapsible-up': 'collapsible-up 0.2s ease-in-out',
      },
    },
  },
  plugins: [animate, typography],
}
