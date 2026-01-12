import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System Colors
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        muted: 'var(--color-muted)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-muted': 'var(--color-accent-muted)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        // Cyber/Neon colors for apps
        'cyber-dark': '#0a0a0f',
        'cyber-darker': '#050508',
        'cyber-light': '#12121a',
        'neon-cyan': '#00f0ff',
        'neon-blue': '#4d7cff',
        'neon-green': '#00ff88',
        'neon-purple': '#b347ff',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        'display-xl': ['var(--text-5xl)', { lineHeight: 'var(--leading-5xl)' }],
        'display-lg': ['var(--text-4xl)', { lineHeight: 'var(--leading-4xl)' }],
        'display': ['var(--text-3xl)', { lineHeight: 'var(--leading-3xl)' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'gold': 'var(--shadow-gold)',
      },
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'base': 'var(--duration-base)',
        'slow': 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        'out': 'var(--ease-out)',
        'spring': 'var(--ease-spring)',
      },
      animation: {
        'fade-up': 'fadeUp var(--duration-slow) var(--ease-out) forwards',
        'fade-in': 'fadeIn var(--duration-base) var(--ease-out) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;