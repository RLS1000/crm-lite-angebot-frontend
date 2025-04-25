import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 4173,
    // ⬇️ ALLOW Railway Preview Domain
    allowedHosts: ['crm-lite-angebot-frontend-production.up.railway.app']
  }
});
