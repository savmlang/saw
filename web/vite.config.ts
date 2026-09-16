import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: "/saw/",

  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss({
      optimize: true
    })
  ],

  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },

  resolve: {
    alias: {
      "#wasm/*": "./src/savm/*"
    }
  }
})
