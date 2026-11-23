// Local development / self-hosted entry point.
// On Vercel this file is NOT used: the API lives in api/index.ts and Vercel
// serves the built frontend (dist/) itself.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './api/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('/{*splat}', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Imported lazily so Vite is only needed in development.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ROSTR Autonomous Agent OS & AlphaSentience server listening on port ${PORT}`);
  });
}

startServer();
