import type { Component } from 'svelte';
import type { LucideProps } from '@lucide/svelte';

export interface CatalogItem {
  id: string;
  img: string;
  chip: string;
  title: string;
  description: string;
  author: string;
  manifest?: Record<string, unknown>;
  file_size: number;
  version: string;
  type: 'ota' | 'usb';
  url?: string;
  file_path?: string;
  downloads?: number;
  user_id?: string | null;
  created_at?: string;
}

export interface CatalogEntry extends CatalogItem {
  user_id?: string | null;
  updated_at?: string;
}


export interface CatalogSection {
    id: string;
    icon: Component<LucideProps>;
    name: string;
    description: string;
    items: CatalogItem[];
    loading: boolean;
    error: string | null;
}