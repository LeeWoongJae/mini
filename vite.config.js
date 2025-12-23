import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/weather': {
        target: 'http://192.168.50.41:3001',  // Node.js 서버 주소
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/weather/, '/weather')
      },
      '/translate': {
        target: 'http://192.168.50.41:3001', 
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/translate/, '/translate')
      },
      '/generate':{
        target:'http://192.168.50.96:8000',
        changeOrigin:true,
        secure:false,
        // rewrite: (path) => path.replace(/^\/translate/, '/translate')
      },
      '/upload_and_generate':{
        target:'http://192.168.50.96:8001',
        changeOrigin:true,
        secure:false,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
})
