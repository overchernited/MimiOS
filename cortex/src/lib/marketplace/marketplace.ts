import { supabase } from './supabase';

const BUCKET = 'cartridges';

export const marketplace = {
  async list(kind: string) {
    const { data, error } = await supabase.from(kind).select('*').order('downloads', { ascending: false });
    if (error) throw error;
    return data;
  },

  async get(kind: string, id: string) {
    const { data, error } = await supabase.from(kind).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async incrementDownloads(kind: string, id: string) {
    const { error } = await supabase.rpc('increment_downloads', { target_kind: kind, target_id: id });
    if (error) throw error;
  },
};

export function binPublicUrl(cartridge: { file_path?: string }) {
  if (!cartridge.file_path) return null;
  return supabase.storage.from(BUCKET).getPublicUrl(cartridge.file_path).data.publicUrl;
}

export async function fetchBin(cartridge: { id: string; file_path?: string }) {
  if (!cartridge.file_path) throw new Error(`El cartridge ${cartridge.id} no tiene firmware (.bin)`);
  const { data, error } = await supabase.storage.from(BUCKET).download(cartridge.file_path);
  if (error) throw error;
  return data.arrayBuffer();
}

export function downloadBin(cartridge: { id: string; file_path?: string }) {
  const url = binPublicUrl(cartridge);
  if (!url) throw new Error(`El cartridge ${cartridge.id} no tiene firmware (.bin)`);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cartridge.id}.bin`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
