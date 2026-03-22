import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ElevenLabs 2026 aesthetic palette
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Primary accent - subtle blue (#4D9CFF)
        'primary-accent': {
          DEFAULT: '#4D9CFF',
          50: '#F0F7FF',
          100: '#E1EEFF',
          200: '#C4DDFF',
          300: '#A7CCFF',
          400: '#7AB5FF',
          500: '#4D9CFF',
          600: '#1A7FFF',
          700: '#0066E5',
          800: '#0050B3',
          900: '#003A80',
        },
        // Secondary accent - soft teal (#9CE6E6)
        'secondary-accent': {
          DEFAULT: '#9CE6E6',
          50: '#F7FEFE',
          100: '#EFFDFD',
          200: '#DFFAFA',
          300: '#CFF7F7',
          400: '#B6F0F0',
          500: '#9CE6E6',
          600: '#6DD6D6',
          700: '#3EC6C6',
          800: '#2AA6A6',
          900: '#1D7A7A',
        },
        // Neutral grayscale (ElevenLabs uses very light grays)
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Functional colors
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#10B981',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#FFFFFF',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        // ElevenLabs-style soft shadows
        'soft-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-md': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'soft-xl': '0 12px 40px rgba(0, 0, 0, 0.10)',
        // Card shadows
        'card': '0 4px 20px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(135deg, #F0F7FF 0%, #EFFDFD 100%)',
        'gradient-accent': 'linear-gradient(135deg, #4D9CFF 0%, #9CE6E6 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
};

export default config;