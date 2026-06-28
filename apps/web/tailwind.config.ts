import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Design Token Colors ───────────────────────────────────────────────
      colors: {
        background: '#0b1326',
        surface: {
          lowest: '#060e20',
          low: '#131b2e',
          DEFAULT: '#171f33',
          high: '#222a3d',
          highest: '#2d3449',
          bright: '#31394d',
        },
        primary: {
          DEFAULT: '#2ddbde',
          container: '#005354',
          fixed: '#5af8fb',
        },
        secondary: {
          DEFAULT: '#a3c9ff',
          container: '#004a86',
        },
        tertiary: {
          DEFAULT: '#ffb77d',
          container: '#723c00',
        },
        'on-background': '#dae2fd',
        'on-surface': '#dae2fd',
        'on-surface-variant': '#c2c6d1',
        'on-primary': '#003738',
        'on-secondary': '#00315c',
        outline: '#8c919b',
        'outline-variant': '#424750',
        error: '#ffb4ab',
        'error-container': '#93000a',
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },

      // ── Spacing ───────────────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // ── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },

      // ── Animations ────────────────────────────────────────────────────────
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(45,219,222,0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(45,219,222,0.55)' },
        },
        'message-in': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'scan-line': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'message-in': 'message-in 250ms ease forwards',
        'float': 'float 4s ease-in-out infinite',
        'scan-line': 'scan-line 8s linear infinite',
      },

      // ── Box Shadows ───────────────────────────────────────────────────────
      boxShadow: {
        'glow-sm': '0 0 12px rgba(45,219,222,0.2)',
        'glow-md': '0 0 24px rgba(45,219,222,0.25)',
        'glow-lg': '0 0 50px rgba(45,219,222,0.15)',
        'glow-warn': '0 0 20px rgba(255,183,125,0.25)',
        'card': '0 4px 32px rgba(0,0,0,0.4)',
      },

      // ── Backdrop Blur ─────────────────────────────────────────────────────
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        DEFAULT: '20px',
        lg: '32px',
      },

      // ── Background Image ──────────────────────────────────────────────────
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #2ddbde 0%, #005354 100%)',
        'warn-gradient': 'linear-gradient(135deg, #ffb77d 0%, #723c00 100%)',
        'page-depth': `
          radial-gradient(ellipse at 20% 20%, rgba(45,219,222,0.04) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 80%, rgba(163,201,255,0.03) 0%, transparent 60%)
        `,
      },
    },
  },
  plugins: [],
};

export default config;
