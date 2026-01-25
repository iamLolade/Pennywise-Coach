/**
 * Authentication utilities for Supabase Auth
 */

import { createClientSupabaseClient } from "./auth-client";
import { createServerSupabaseClient } from "./server";

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string) {
  const supabase = createClientSupabaseClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = createClientSupabaseClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClientSupabaseClient();
  
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get the current user session (client-side)
 */
export async function getSession() {
  const supabase = createClientSupabaseClient();
  
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return session;
}

/**
 * Get the current user (client-side)
 */
export async function getCurrentUser() {
  const supabase = createClientSupabaseClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return user;
}

/**
 * Get the current user session (server-side)
 */
export function getServerSession() {
  const supabase = createServerSupabaseClient();
  
  return supabase.auth.getSession();
}

/**
 * Get the current user (server-side)
 */
export function getServerUser() {
  const supabase = createServerSupabaseClient();
  
  return supabase.auth.getUser();
}
