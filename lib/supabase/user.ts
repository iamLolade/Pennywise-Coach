/**
 * User profile operations with Supabase
 */

import { createClientSupabaseClient } from "./auth-client";
import type { UserProfile } from "@/types";

/**
 * Get the authenticated user ID from Supabase Auth
 */
async function getUserId(): Promise<string | null> {
  const supabase = createClientSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Get user profile from Supabase
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const userId = await getUserId();
  
  if (!userId) {
    return null;
  }

  const supabase = createClientSupabaseClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No profile found
      return null;
    }
    console.error("Error fetching user profile:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    incomeRange: data.income_range,
    goals: data.goals,
    concerns: data.concerns,
    onboardingComplete: data.onboarding_complete,
  };
}

/**
 * Save user profile to Supabase
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("User must be authenticated to save profile");
  }

  const supabase = createClientSupabaseClient();
  const { error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        user_id: userId,
        income_range: profile.incomeRange,
        goals: profile.goals,
        concerns: profile.concerns,
        onboarding_complete: profile.onboardingComplete,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    console.error("Error saving user profile:", error);
    throw new Error("Failed to save user profile");
  }
}
