/**
 * Legacy Supabase client - kept for backward compatibility
 * 
 * @deprecated Use createClientSupabaseClient() for client components
 * or createServerSupabaseClient() for server components/API routes
 * 
 * This module is kept for existing code that hasn't been migrated yet.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
