import type { SensorData } from '@/types/sensor.types';

class sensorStore {
  device_id = $state<string | null>(null);
  device_name = $state<string>('Mimi OS');
  data = $state<SensorData | null>(null);
  connected = $state(false);

  setMaster(info: { device_id: string | null; device_name: string | null; connected: boolean }) {
    this.device_id = info.device_id;
    this.device_name = info.device_name ?? 'Mimi OS';
    this.connected = info.connected;
    if (!info.connected) this.data = null;
  }

  upsert(data: SensorData) {
    this.data = data;
  }

  clear() {
    this.device_id = null;
    this.device_name = 'Mimi OS';
    this.data = null;
    this.connected = false;
  }
}

export const SensorStore = new sensorStore();
