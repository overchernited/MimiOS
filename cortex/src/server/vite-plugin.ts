import type { Plugin } from 'vite';
import { handleUpgrade, startHeartbeat } from './api.js';

export function apiServer(): Plugin {
  return {
    name: 'api-server',
    configureServer(server) {
      startHeartbeat();
      server.httpServer?.on('upgrade', handleUpgrade);
    },
  };
}
