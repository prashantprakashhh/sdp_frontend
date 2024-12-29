import type { Config } from 'tailwindcss';
import colors from './tailwind.colors';
import typography from './tailwind.typography';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: colors,
      fontFamily: typography.fontFamily,
      borderRadius: {
        none: '0px',
        sm: 'calc(var(--radius) - 2px)',
        DEFAULT: 'var(--radius)',
        md: 'calc(var(--radius) + 2px)',
        lg: 'calc(var(--radius) + 4px)',
        xl: 'calc(var(--radius) + 6px)',
        full: '9999px',
      },

      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1),' + '0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1),' +
          '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg:
          '0 10px 15px -3px rgba(0, 0, 0, 0.1),' +
          '0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1),' +
          '0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      zIndex: {
        '-1': '-1',
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        auto: 'auto',
      },
      screens: {
        xs: '480px',
        sm: '640px', // Default Tailwind sm breakpoint
        md: '768px', // Default Tailwind md breakpoint
        lg: '1024px', // Default Tailwind lg breakpoint
        xl: '1280px', // Default Tailwind xl breakpoint
        '2xl': '1536px', // Default Tailwind 2xl breakpoint
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
