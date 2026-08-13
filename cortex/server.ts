import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { wss, handleUpgrade } from './src/server/api.js';

const PORT = Number(process.env.PORT ?? 3000);
const DIST_DIR = join(import.meta.dirname, 'dist');

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

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  let filePath = join(DIST_DIR, url.pathname === '/' ? 'index.html' : url.pathname);

  try {
    const content = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream' });
    res.end(content);
  } catch {
    const fallback = await readFile(join(DIST_DIR, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fallback);
  }
});

server.on('upgrade', handleUpgrade);

server.listen(PORT, () => {
  console.log(`MimicroOS server corriendo en http://0.0.0.0:${PORT}`);
  console.log(`  Frontend:  http://0.0.0.0:${PORT}/`);
  console.log(`  ESP32 WS:  ws://0.0.0.0:${PORT}/ws/esp32`);
  console.log(`  Browser WS: ws://0.0.0.0:${PORT}/ws/data`);
});
