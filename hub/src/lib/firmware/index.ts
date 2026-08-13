import { supabase } from '../supabase';
import type { Firmware } from '../types';

export const FIRMWARE_FOLDER = 'firmware';

const BUCKET = 'cartridges';

export async function listFirmwares(): Promise<Firmware[]> {
  const { data, error } = await supabase()
    .from('firmware')
    .select('*')
    .order('chip');
  if (error) throw error;
  return (data as unknown as Firmware[]) ?? [];
}

export function firmwareDownloadUrl(id: string): string | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!url) return null;
  return `${url}/storage/v1/object/public/${BUCKET}/${FIRMWARE_FOLDER}/${id}.bin`;
}

export function filesystemDownloadUrl(id: string): string | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!url) return null;
  return `${url}/storage/v1/object/public/${BUCKET}/${FIRMWARE_FOLDER}/${id}-fs.bin`;
}
