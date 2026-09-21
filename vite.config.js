import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/gov-api/incois': {
        target: 'https://erddap.incois.gov.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gov-api\/incois/, ''),
        secure: false,
      },
      '/gov-api/datagov': {
        target: 'https://api.data.gov.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gov-api\/datagov/, ''),
        secure: false,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase'
            if (id.includes('leaflet')) return 'vendor-leaflet'
            if (id.includes('react') || id.includes('scheduler')) return 'vendor-react'
            return 'vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 650,
  },
})