import { supabase } from '../supabase';
import type { Firmware } from '../types';

export const FIRMWARE_FOLDER = 'firmware';

const BUCKET = 'cartridges';

export async function listFirmwares(): Promise<Firmware[]> {
  const { data, error } = await supabase()
    .from('cartridges')
    .select('*')
    .order('chip')
    .eq('author', 'MimiOS');
  if (error) throw error;
  return (data as unknown as Firmware[]) ?? [];
}
