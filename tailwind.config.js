/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0F1115',
          light: '#23272F',
          muted: '#4B5563',
        },
        slate: {
          DEFAULT: '#6B7280',
          light: '#9CA3AF',
          dark: '#374151',
        },
        mist: {
          DEFAULT: '#E7E7EA',
          light: '#F3F4F6',
          dark: '#D1D5DB',
        },
        paper: {
          DEFAULT: '#FAF7F1',
          pure: '#FFFFFF',
          dark: '#F2EFE8',
          warm: '#F5F0E6',
        },
        orange: {
          DEFAULT: '#FF9D1A',
          hover: '#F08C0A',
          light: '#FFF4E5',
        },
        lime: {
          DEFAULT: '#A6E22E',
          hover: '#95CD26',
          light: '#F4FBE8',
        }
      },
      fontFamily: {
        display: ['var(--font-satoshi)', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'sketch': '3px 3px 0px 0px #0F1115',
        'sketch-lg': '5px 5px 0px 0px #0F1115',
        'sketch-xl': '8px 8px 0px 0px #0F1115',
        'sketch-orange': '4px 4px 0px 0px #FF9D1A',
        'sketch-sm': '2px 2px 0px 0px #0F1115',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(#0F1115 0.75px, transparent 0.75px), radial-gradient(#0F1115 0.75px, #FAF7F1 0.75px)",
      }
    },
  },
  plugins: [],
}
