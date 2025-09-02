  // vite.config.js
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path
        },
      },
      headers: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:; connect-src 'self' http://localhost:5000 https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://www.googleapis.com https://ck-study-backend.vercel.app https://ckstudyclasses.s3.eu-north-1.amazonaws.com https://lumberjack.razorpay.com; frame-src https://www.youtube.com https://checkout.razorpay.com https://api.razorpay.com; img-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com https://ckstudyclasses.s3.eu-north-1.amazonaws.com https://i.ytimg.com; object-src 'none'; upgrade-insecure-requests;"
      }
      
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    }
  });
