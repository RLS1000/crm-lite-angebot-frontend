import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 4173,
    // ✅ Erlaubte Hosts als Array von Strings
    allowedHosts: [
      'crm-lite-angebot-frontend-production.up.railway.app',
      'angebot.mrknips.de'
    ]
  }
});
