import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      config: {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#135bec",
              "background-light": "#f6f6f8",
              "background-dark": "#101622",
              "surface-light": "#ffffff",
              "surface-dark": "#1a2232",
              "text-light-primary": "#111318",
              "text-dark-primary": "#f6f6f8",
              "text-light-secondary": "#616f89",
              "text-dark-secondary": "#9ea8ba",
              "border-light": "#dbdfe6",
              "border-dark": "#343d50",
            },
            fontFamily: {
              "display": ["Lexend", "sans-serif"]
            },
            animation: {
              'shake': 'shake 0.5s ease-in-out',
              'float': 'float 3s ease-in-out infinite',
              'glow': 'glow 2s ease-in-out infinite',
              'slide-in': 'slideIn 0.6s ease-out',
            },
            backdropBlur: {
              xs: '2px',
            }
          },
        },
      }
    })
  ],
})