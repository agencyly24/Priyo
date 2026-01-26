
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Support multiple variations of the API key name, including the one set in Vercel.
  // We prioritize the names you provided to ensure no crash after environment change.
  const apiKey = 
    env.Generative_Language_API_Key || 
    env.Generative_Language_API || 
    env.API_KEY || 
    env.GOOGLE_API_KEY || 
    process.env.Generative_Language_API_Key || 
    process.env.Generative_Language_API || 
    process.env.API_KEY || 
    process.env.GOOGLE_API_KEY || 
    '';

  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY is replaced with the actual string during build
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    server: {
      port: 3000
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', '@google/genai'],
          },
        },
      },
    }
  };
});
