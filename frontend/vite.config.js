import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import vitePluginCss from 'vite-plugin-css'

// export default defineConfig({
//   plugins: [
//     react(),
//     vitePluginCss(), // Add CSS plugin
//   ],
// })
