import { supabase } from '../supabase';
import { auth } from '../auth.svelte';

export interface Profile {
  id: string;
  username: string;
  created_at?: string;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase()
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Profile | null;
}

export async function getOwnProfile(): Promise<Profile | null> {
  const uid = auth.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase()
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Profile | null;
}

export async function usernameFor(userId: string | null | undefined): Promise<string | null> {
  if (!userId) return null;
  const { data, error } = await supabase()
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle();
  if (error) return null;
  return (data as unknown as { username: string } | null)?.username ?? null;
}
