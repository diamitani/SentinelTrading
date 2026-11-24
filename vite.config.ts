import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  // Only variables starting with these prefixes are visible in the browser.
  // NEXT_PUBLIC_ is included because the Vercel <-> Supabase connection saves
  // the public Supabase URL + anon key under that name. Secret keys
  // (SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SECRET_KEY, POSTGRES_*) have no such
  // prefix, so they never reach the browser.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
