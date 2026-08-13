import { NotificationStore } from "@/stores/notifications.svelte";
import { SensorStore } from "@/stores/sensor.svelte";
import { LogStore } from "@/stores/logs.svelte";
import { StorageStore } from "@/stores/storage.svelte";
import { AuthStore } from "@/stores/auth.svelte";
import { WidgetStore } from "@/stores/widgets.svelte";
import { WindowStore } from "@/stores/windows.svelte";
import { OtaStore } from "@/stores/ota.svelte";

const RECONNECT_DELAY = 3000;

let ws: WebSocket | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

function clearState() {
  AuthStore.clear();
  StorageStore.clear();
  WidgetStore.clear();
  WindowStore.clear();
  NotificationStore.clear();
  LogStore.clear();
  SensorStore.clear();
}

function connect() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${proto}//${location.host}/ws/data`);

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    switch (msg.type) {
      case 'master':
        SensorStore.setMaster(msg);
        if (!msg.connected) {
          if (OtaStore.active) OtaStore.finish();
          clearState();
        }
        break;
      case 'sensor':
        SensorStore.upsert(msg);
        break;
      case 'notification':
        NotificationStore.add({
          id: crypto.randomUUID(),
          title: msg.title,
          message: msg.message,
          process: msg.process,
          color: msg.color,
          timestamp: Date.now()
        });
        break;
      case 'log':
        LogStore.add({ id: crypto.randomUUID(), message: msg.message, timestamp: Date.now() });
        break;
      case 'preferences':
        StorageStore.load({
          ...msg.config,
          os: msg.os,
          cartridge: msg.cartridge,
          cartridge_version: msg.cartridge_version,
          model: msg.model,
          cores: msg.cores,
          cpu_freq: msg.cpu_freq,
          revision: msg.revision,
          flash_size: msg.flash_size,
          flash_speed: msg.flash_speed,
          heap: msg.heap,
          mac: msg.mac
        });
        break;
    }

    if (msg.cmd === 'ota_result') {
      NotificationStore.add({
        id: crypto.randomUUID(),
        title: 'OTA',
        message: msg.ok ? 'Firmware flash complete, rebooting...' : `OTA failed: ${msg.msg ?? 'unknown error'}`,
        process: 'Cortex',
        color: msg.ok ? '#35E4FF' : '#FF6D6B',
        timestamp: Date.now()
      });
      if (!msg.ok) OtaStore.finish();
    }
  };

  ws.onclose = () => {
    clearState();
    timer = setTimeout(connect, RECONNECT_DELAY);
  };

  ws.onerror = () => ws?.close();
}

export function send(data: object) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export function sendBinary(data: ArrayBuffer) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(data);
  }
}

export function wsBufferedAmount() {
  return ws?.bufferedAmount ?? 0;
}

export async function validateAuth(data: { username: string; password: string }) {
  if (ws?.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket not connected');
  }

  const payload = {
    cmd: 'validate_auth',
    username: data.username,
    password: data.password,
  };

  return await new Promise<boolean>((resolve, reject) => {
    const onMessage = (e: MessageEvent) => {
      const msg = JSON.parse(e.data);
      if (msg.cmd === 'validate_auth_result') {
        ws?.removeEventListener('message', onMessage);
        resolve(Boolean(msg.valid));
      }
    };

    ws?.addEventListener('message', onMessage);
    ws?.send(JSON.stringify(payload));
  });
}

if (typeof window !== 'undefined') connect();
