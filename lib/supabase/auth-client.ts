/**
 * Client-side Supabase client for Client Components
 * 
 * This creates a Supabase client that works in the browser
 * with automatic session persistence.
 */

import { createClient } from "@supabase/supabase-js";

export function createClientSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // Client-side persists sessions in localStorage
      autoRefreshToken: true,
    },
  });
}
