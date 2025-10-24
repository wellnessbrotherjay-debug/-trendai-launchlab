import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0f1220",
        neon: {
          teal: "#00D1B2",
          purple: "#6C5CE7",
        },
      },
      keyframes: {
        progress: {
          '0%': { width: '18%' },
          '50%': { width: '92%' },
          '100%': { width: '18%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slowspin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        progress: 'progress 6s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        slowspin: 'slowspin 6s linear infinite',
      },
      backgroundImage: {
        'hero-radials':
          'radial-gradient(circle at 20% 20%, rgba(108, 92, 231, 0.14), transparent 35%), radial-gradient(circle at 80% 30%, rgba(0, 209, 178, 0.12), transparent 35%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.05), transparent 35%)',
        'panel-grad': 'linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(255,255,255,0.03))',
        'conic-core': 'conic-gradient(from 0deg, #6C5CE7, #00D1B2, #6C5CE7)'
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.glass': {
          '@apply border border-white/10 bg-white/5 backdrop-blur-xl': {},
        },
      });
    },
  ],
};

export default config;

