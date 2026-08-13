import { join } from 'node:path';
import { startServer } from './src/server/http.js';

startServer({ distDir: join(import.meta.dirname, 'dist') }).catch((err) => {
  console.error(err);
  process.exit(1);
});
