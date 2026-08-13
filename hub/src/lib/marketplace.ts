import { supabase } from './supabase';
import type { CatalogEntry } from './types';

export const CATALOG_KINDS = ['apps', 'widgets', 'cartridges'] as const;
export type CatalogKind = (typeof CATALOG_KINDS)[number];


export const marketplace = {
  async list(kind: CatalogKind) {
    const orderColumn = kind === 'cartridges' ? 'created_at' : 'downloads';
    const { data, error } = await supabase()
      .from(kind)
      .select('*')
      .order(orderColumn, { ascending: false });
    if (error) throw error;
    return data as unknown as CatalogEntry[];
  },

  async get(kind: CatalogKind, id: string) {
    const { data, error } = await supabase()
      .from(kind)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as unknown as CatalogEntry | null;
  },

  async listByUser(kind: CatalogKind, userId: string) {
    const { data, error } = await supabase()
      .from(kind)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as CatalogEntry[];
  },
};

export function catalogDownloadUrl(item: Pick<CatalogEntry, 'file_path'>): string | null {
  if (!item.file_path) return null;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!url) return null;
  return `${url}/storage/v1/object/public/cartridges/${item.file_path}`;
}

export function formatBytes(n: number) {
  if (!n || n <= 0) return '—';
  if (n < 1024) return `${n} B`;
  
  const units = ['KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  const value = n / Math.pow(1024, i);
  const unit = units[i - 1];

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}
