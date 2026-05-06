import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

/**
 * Browser client (anon / publishable key). Use only for tables you expose via RLS.
 * Voice pipeline + writes still go through the FastAPI backend by default.
 */
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env',
    );
  }
  return supabase;
}
