import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';

let esp32: WebSocket | null = null;
let deviceId: string | null = null;
let deviceName: string | null = null;
let devicePrefs: unknown = null;
const browsers = new Set<WebSocket>();

const HEARTBEAT_INTERVAL = 10_000;

interface LiveSocket extends WebSocket {
  isAlive?: boolean;
}

function sendToBrowser(ws: WebSocket, data: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcastToBrowsers(data: object) {
  for (const browser of browsers) sendToBrowser(browser, data);
}

function sendMasterStatus() {
  broadcastToBrowsers({
    type: 'master',
    device_id: esp32 ? deviceId : null,
    device_name: esp32 ? deviceName ?? deviceId : null,
    connected: esp32?.readyState === WebSocket.OPEN,
  });
}

function sendMasterPrefs() {
  if (esp32 && devicePrefs) broadcastToBrowsers(devicePrefs);
}

function routeToEsp32(raw: string | Buffer) {
  if (esp32?.readyState === WebSocket.OPEN) {
    esp32.send(raw);
  } else {
    broadcastToBrowsers({ type: 'error', message: 'Device is not connected' });
  }
}

function handleEsp32Message(raw: Buffer) {
  const msg = JSON.parse(raw.toString());

  if (msg?.type === 'register' && typeof msg.device_id === 'string') {
    deviceId = msg.device_id;
    deviceName = msg.device_name || msg.device_id;
    sendNotification('Microcontroller', `${deviceName} is now master`, 'Cortex', '#35E4FF');
    sendMasterStatus();
    sendMasterPrefs();
    return;
  }

  if (msg?.type === 'preferences') {
    devicePrefs = msg;
    broadcastToBrowsers(msg);
    return;
  }

  if (msg?.type === 'notification' || msg?.type === 'log' || msg?.type === 'pong') {
    broadcastToBrowsers(msg);
    return;
  }

  if (typeof msg?.cmd === 'string') {
    broadcastToBrowsers(msg);
    return;
  }

  if (typeof msg?.device_id === 'string') {
    broadcastToBrowsers({ ...msg, type: 'sensor' });
    return;
  }

  broadcastToBrowsers(msg);
}

function handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
  const path = new URL(req.url ?? '/', `http://${req.headers.host}`).pathname;

  if (path !== '/ws/esp32' && path !== '/ws/data') {
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
}

const wss = new WebSocketServer({ noServer: true });

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

export function startHeartbeat() {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    for (const ws of wss.clients as Set<LiveSocket>) {
      if (ws.readyState !== WebSocket.OPEN) continue;

      if (ws.isAlive === false) {
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      try {
        ws.ping();
      } catch {
        ws.terminate();
      }
    }
  }, HEARTBEAT_INTERVAL);

  wss.on('close', () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  });
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const live = ws as LiveSocket;
  live.isAlive = true;

  live.on('pong', () => {
    live.isAlive = true;
  });
  live.on('message', () => {
    live.isAlive = true;
  });
  const path = new URL(req.url ?? '/', `http://${req.headers.host}`).pathname;

  if (path === '/ws/esp32') {
    if (esp32 && esp32 !== ws && esp32.readyState === WebSocket.OPEN) {
      ws.close();
      return;
    }

    esp32 = ws;

    ws.on('message', (raw: Buffer) => {
      try {
        handleEsp32Message(raw);
      } catch {
        console.error('[WS] JSON invalido');
      }
    });

    ws.on('close', () => {
      if (esp32 !== ws) return;
      const name = deviceName ?? 'Microcontroller';
      esp32 = null;
      deviceId = null;
      deviceName = null;
      sendMasterStatus();
      sendNotification('Microcontroller', `${name} disconnected`, 'Cortex', '#FF6D6B');
    });

    return;
  }

  browsers.add(ws);
  sendNotification('Welcome', 'Welcome to MimiOS', 'Cortex', '#FFCC00');
  sendMasterStatus();
  sendMasterPrefs();

  ws.on('message', (raw, isBinary) => {
    if (!isBinary) {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg?.cmd === 'request_devices') {
          sendMasterStatus();
          sendMasterPrefs();
          return;
        }

        routeToEsp32(raw.toString());
      } catch {
        console.error('[WS] JSON invalido');
      }
      return;
    }

    routeToEsp32(raw as Buffer);
  });

  ws.on('close', () => {
    browsers.delete(ws);
    console.log('[WS] Browser disconnected');
  });
});

export function sendNotification(title: string, message: string, process: string, color: string) {
  broadcastToBrowsers({ type: 'notification', title, message, process, color });
}

export { wss, handleUpgrade };
