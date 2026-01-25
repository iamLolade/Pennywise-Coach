/**
 * User profile operations with Supabase
 */

import { supabase } from "./client";
import type { UserProfile } from "@/types";

/**
 * Generate a simple user ID for MVP (in production, use Supabase Auth)
 */
function getUserId(): string {
  if (typeof window === "undefined") {
    return "anonymous";
  }
  
  // For MVP, use a stored user ID or generate one
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("userId", userId);
  }
  return userId;
}

/**
 * Get user profile from Supabase
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const userId = getUserId();
  
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
  const userId = getUserId();

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
