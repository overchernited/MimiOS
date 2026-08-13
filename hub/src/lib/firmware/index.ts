import { supabase } from '../supabase';
import type { CatalogItem } from '../types';

export const FIRMWARE_FOLDER = 'firmware';

const BUCKET = 'cartridges';

export async function listFirmwares(): Promise<CatalogItem[]> {
  const { data, error } = await supabase()
    .from('cartridges')
    .select('*')
    .order('chip')
    .eq('author', 'MimiOS')
    .eq('type', 'usb')
    ;
  if (error) throw error;
  return (data as unknown as CatalogItem[]) ?? [];
}
