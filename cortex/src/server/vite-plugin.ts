import type { Plugin } from 'vite';
import { handleUpgrade } from './api.js';

export function apiServer(): Plugin {
  return {
    name: 'api-server',
    configureServer(server) {
      server.httpServer?.on('upgrade', handleUpgrade);
    },
  };
}
