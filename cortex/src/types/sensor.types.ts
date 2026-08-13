export interface SensorData {
  device_id: string;
  gpio: number;
  voltage: number;
  temperature: number;
  free_sram: number;
  free_flash: number;
}
