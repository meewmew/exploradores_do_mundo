import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), basicSsl()],
    server: { host: '0.0.0.0', port: 5173, strictPort: true, allowedHosts: env.VITE_PUBLIC_URL ? [new URL(env.VITE_PUBLIC_URL).hostname] : [] },
    build: { chunkSizeWarningLimit: 600 },
    test: { environment: 'node', include: ['tests/**/*.test.ts'] },
  };
});
