import { supabase } from '../supabase';
import { auth } from '../auth.svelte';
import { usernameFor } from '../profiles';
import type { CatalogKind } from '../marketplace';
import type { CatalogEntry } from '../types';

export interface CartridgeDraft {
  title: string;
  description: string;
  version: string;
  chip: string;
  img?: string;
  file: File;
  manifest: Record<string, unknown>;
  user_id?: string | null;
}

export interface AppDraft {
  title: string;
  description: string;
  version: string;
  author: string;
  img?: string;
  manifest: Record<string, unknown>;
  user_id?: string | null;
}

export interface WidgetDraft {
  title: string;
  description: string;
  version: string;
  author: string;
  img?: string;
  manifest: Record<string, unknown>;
  user_id?: string | null;
}

export const UPLOAD_CHIPS = ['esp32', 'esp32s3', 'esp32c3', 'esp32s2'] as const;

function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'cartridge';
}

function shortId(): string {
  return Math.random().toString(36).slice(2, 6);
}



export async function uploadCartridge(draft: CartridgeDraft): Promise<string> {
  const user = auth.user;
  if (!user) throw new Error('sign in to publish a cartridge');

  const username = (await usernameFor(user.id)) ?? 'unknown';
  const id = `${slugify(draft.title)}-${shortId()}`;
  const filePath = `${user.id}/${id}.bin`;

  const { error: uploadError } = await supabase()
    .storage.from('cartridges')
    .upload(filePath, draft.file, { upsert: false, contentType: 'application/octet-stream' });
  if (uploadError) throw uploadError;

  const { error } = await supabase().from('cartridges').insert({
    id,
    title: draft.title,
    description: draft.description,
    author: username,
    version: draft.version,
    chip: draft.chip,
    img: draft.img?.trim() || undefined,
    manifest: draft.manifest,
    file_path: filePath,
    file_size: draft.file.size,
    user_id: user.id
  });
  if (error) throw error;
  return id;
}


export async function uploadApp(draft: AppDraft): Promise<string> {
  const user = auth.user;
  if (!user) throw new Error('sign in to publish an app');

  const username = (await usernameFor(user.id)) ?? 'unknown';
  const id = `${slugify(draft.title)}-${shortId()}`;

  const { error } = await supabase().from('apps').insert({
    id,
    title: draft.title,
    description: draft.description,
    version: draft.version,
    author: username,
    img: draft.img?.trim() || undefined,
    manifest: draft.manifest,
    user_id: user.id
  });
  if (error) throw error;
  return id;
}


export async function uploadWidget(draft: WidgetDraft): Promise<string> {
  const user = auth.user;
  if (!user) throw new Error('sign in to publish a widget');

  const username = (await usernameFor(user.id)) ?? 'unknown';
  const id = `${slugify(draft.title)}-${shortId()}`;

  const { error } = await supabase().from('widgets').insert({
    id,
    title: draft.title,
    description: draft.description,
    version: draft.version,
    author: username,
    img: draft.img?.trim() || undefined,
    manifest: draft.manifest,
    user_id: user.id
  });
  if (error) throw error;
  return id;
}

export async function removeCatalogItem(kind: CatalogKind, item: CatalogEntry): Promise<void> {
  if (kind === 'cartridges' && item.file_path) {
    const { error: storageError } = await supabase().storage.from('cartridges').remove([item.file_path]);
    if (storageError) throw storageError;
  }
  const { error } = await supabase().from(kind).delete().eq('id', item.id);
  if (error) throw error;
}
