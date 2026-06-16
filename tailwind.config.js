/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#FFF3EC",
          100: "#FFE0CC",
          200: "#FFC499",
          300: "#FFA866",
          400: "#FF8C33",
          500: "#FF6B35",
          600: "#E55A2B",
          700: "#CC4D24",
          800: "#B3401E",
          900: "#993318",
        },
        secondary: {
          50: "#E8EDF4",
          100: "#C5D2E5",
          200: "#8BA6CB",
          300: "#527AB1",
          400: "#365A8E",
          500: "#1E3A5F",
          600: "#182F4D",
          700: "#12243A",
          800: "#0C1927",
          900: "#060D15",
        },
        danger: {
          50: "#FDE8EA",
          100: "#F9C0C6",
          200: "#F598A2",
          300: "#F0707E",
          400: "#EB485A",
          500: "#E63946",
          600: "#C92D39",
          700: "#AB212C",
          800: "#8E1620",
          900: "#700A13",
        },
        success: {
          50: "#E6F8EE",
          100: "#B3EBD0",
          200: "#80DEB2",
          300: "#4DD194",
          400: "#1AC476",
          500: "#00A862",
          600: "#008C52",
          700: "#007042",
          800: "#005432",
          900: "#003821",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'flash': 'flash 1s ease-in-out infinite',
      },
      keyframes: {
        flash: {
          '0%, 50%, 100%': { opacity: '1' },
          '25%, 75%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
