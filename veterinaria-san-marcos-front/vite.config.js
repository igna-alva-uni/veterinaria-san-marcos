import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// En desarrollo el frontend llama a rutas relativas /api/v1/... y Vite las reenvía al API Gateway.
// Con Docker Compose el destino es http://ms-api-gateway:9001 (variable API_PROXY_TARGET).
const destinoApi = process.env.API_PROXY_TARGET || 'http://localhost:9001'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      '/api': {
        target: destinoApi,
        changeOrigin: true,
      },
    },
  },

  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "tests-jasmine/**",
      // Pruebas de la EP2 que simulaban el backend con localStorage. Desde la EP3 los datos
      // viven en la API; se conservan como referencia, pero ya no describen el comportamiento real.
      "src/App.test.jsx",
      "src/data/integracion.test.js",
      "src/features/clinica/ClinicaPages.test.jsx",
      "src/features/clinica/GestionClinica.test.jsx",
      "src/features/dashboard/PanelPage.test.jsx",
    ],
  },
});
