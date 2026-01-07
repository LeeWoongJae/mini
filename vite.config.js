import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
import { env } from 'process';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(),'');

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/weather': {
          target: env.MY_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/translate': {
          target: env.MY_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/generate': {
          target: env.GENERATE_API_IP,
          changeOrigin: true,
          secure: false,
        },
        '/upload_and_generate': {
          target: env.VL_API_IP,
          changeOrigin: true,
          secure: false,
        },
        '/naver/shop': {
          target: env.MY_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
