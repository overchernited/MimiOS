import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { networkInterfaces } from 'node:os';
import { startServer } from '../src/server/http.js';

const DEV_URL = process.env.VITE_DEV_SERVER_URL;

let win: BrowserWindow | null = null;
let port = 3000;

function lanAddresses(): string[] {
  const addrs: string[] = [];
  for (const infos of Object.values(networkInterfaces())) {
    for (const info of infos ?? []) {
      if (info.family === 'IPv4' && !info.internal) addrs.push(info.address);
    }
  }
  return addrs;
}

async function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    maximizable: false, // Deshabilita el botón de maximizar/restaurar nativo
    minimizable: false,
    resizable: false,    // Bloquea el redimensionamiento manual por completo
    fullscreenable: false,
    title: 'MimiOS Cortex',
    backgroundColor: '#0a0a0f',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Usamos el modo Kiosk o maximizado forzado por pantalla
  win.maximize();

  win.once('ready-to-show', () => {
    win?.show();
  });

  win.on('page-title-updated', (e: Electron.Event) => {
    e.preventDefault();
  });

  win.on('closed', () => {
    win = null;
  });

  if (DEV_URL) {
    await win.loadURL(DEV_URL);
  } else {
    await win.loadURL(`http://127.0.0.1:${port}`);
  }
}

async function boot() {
  if (!DEV_URL) {
    const handle = await startServer({
      port: 3000,
      host: '0.0.0.0',
      distDir: join(import.meta.dirname, '../../dist'),
    });
    port = handle.port;
    for (const ip of lanAddresses()) {
      console.log(`  ESP32 WS:  ws://${ip}:${port}/ws/esp32`);
    }
  }

  await app.whenReady();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  boot().catch((err) => {
    console.error(err);
    app.quit();
  });
}
