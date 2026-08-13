import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { handleUpgrade, startHeartbeat } from './api.js';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

export interface StartServerOptions {
  port?: number;
  host?: string;
  distDir?: string;
}

export interface ServerHandle {
  server: ReturnType<typeof createServer>;
  port: number;
  host: string;
  url: string;
}

function listen(server: ReturnType<typeof createServer>, port: number, host: string): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      const addr = server.address();
      resolve(typeof addr === 'object' && addr ? addr.port : port);
    });
  });
}

export async function startServer(options: StartServerOptions = {}): Promise<ServerHandle> {
  const port = options.port ?? Number(process.env.PORT ?? 3000);
  const host = options.host ?? '0.0.0.0';
  const distDir = options.distDir ?? join(process.cwd(), 'dist');

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    let filePath = join(distDir, url.pathname === '/' ? 'index.html' : url.pathname);

    try {
      const content = await readFile(filePath);
      const ext = extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream' });
      res.end(content);
    } catch {
      try {
        const fallback = await readFile(join(distDir, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fallback);
      } catch {
        res.writeHead(503, { 'Content-Type': 'text/plain' });
        res.end('Frontend not built. Run `pnpm build` first.');
      }
    }
  });

  server.on('upgrade', handleUpgrade);
  startHeartbeat();

  let actualPort: number;
  try {
    actualPort = await listen(server, port, host);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code !== 'EADDRINUSE') throw err;
    actualPort = await listen(server, 0, host);
    console.log(`[server] port ${port} in use, using ${actualPort}`);
  }

  console.log(`MimicroOS server corriendo en http://${host}:${actualPort}`);
  console.log(`  Frontend:  http://${host}:${actualPort}/`);
  console.log(`  ESP32 WS:  ws://${host}:${actualPort}/ws/esp32`);
  console.log(`  Browser WS: ws://${host}:${actualPort}/ws/data`);

  return {
    server,
    port: actualPort,
    host,
    url: `http://127.0.0.1:${actualPort}`,
  };
}
