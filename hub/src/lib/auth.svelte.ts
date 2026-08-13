import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

let user: User | null = $state(null);
let ready = $state(false);
let recovering = $state(false);
let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;
  const client = supabase();
  void client.auth.getSession().then(({ data }) => {
    user = data.session?.user ?? null;
    ready = true;
  });
  client.auth.onAuthStateChange((event, session) => {
    user = session?.user ?? null;
    if (event === 'PASSWORD_RECOVERY') recovering = true;
  });
}

export const auth = {
  get user() {
    return user;
  },
  get ready() {
    return ready;
  },
  get recovering() {
    return recovering;
  },
  init,

  async signUp(email: string, password: string, username: string) {
    const emailRedirectTo =
      typeof window !== 'undefined' ? window.location.origin : undefined;
    const { data, error } = await supabase().auth.signUp({
      email,
      password,
      options: { data: { username }, emailRedirectTo }
    });
    if (error) throw error;
    if (!data.user) {
      throw new Error('email already registered');
    }
  },

  async signIn(email: string, password: string) {
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase().auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/recover` : undefined;
    const { error } = await supabase().auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  },

  async updatePassword(password: string) {
    const { error } = await supabase().auth.updateUser({ password });
    if (error) throw error;
  }
};
