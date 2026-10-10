/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        '3xl': '1.5rem',
        '2xl': '1rem',
        xl: '0.75rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Premium Chocolate Brown + Cream System
        chocolate: {
          DEFAULT: '#6F4028',
          deep: '#2B1B14',
          mocha: '#4A2E22',
          dark: '#38241B',
          hover: '#805236',
          light: '#8C5638',
        },
        cream: {
          DEFAULT: '#F5EBDD',
          ivory: '#FFF9F0',
          light: '#FFF8ED',
          warm: '#F5EBDD',
          beige: '#E8D5BF',
          hover: '#EAD8C2',
        },
        caramel: {
          DEFAULT: '#C58B55',
          gold: '#C58B55',
          light: '#D4A373',
          dark: '#A86F3E',
        },
        'soft-border': '#E8D5BF',
        chart: {
          1: '#6F4028',
          2: '#C58B55',
          3: '#4A2E22',
          4: '#786453',
          5: '#E8D5BF',
        },
      },
      boxShadow: {
        'luxury-sm': '0 2px 8px -1px rgba(43, 27, 20, 0.06), 0 1px 3px -1px rgba(43, 27, 20, 0.04)',
        'luxury': '0 8px 24px -4px rgba(43, 27, 20, 0.08), 0 3px 8px -2px rgba(43, 27, 20, 0.04)',
        'luxury-lg': '0 20px 45px -10px rgba(43, 27, 20, 0.12), 0 8px 16px -4px rgba(43, 27, 20, 0.06)',
        'luxury-glow': '0 0 30px -5px rgba(197, 139, 85, 0.35)',
        'gold-sm': '0 0 12px -2px rgba(197, 139, 85, 0.25)',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.85' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float-slow': 'float 5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
