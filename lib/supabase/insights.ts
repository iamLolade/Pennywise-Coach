/**
 * Insights operations with Supabase
 */

import { createClientSupabaseClient } from "./auth-client";
import type { DailyInsight } from "@/types";

/**
 * Get the authenticated user ID from Supabase Auth
 */
async function getUserId(): Promise<string | null> {
  const supabase = createClientSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Get insights from Supabase
 */
export async function getInsights(
  type: "daily" | "weekly",
  limit: number = 10
): Promise<DailyInsight[]> {
  const userId = await getUserId();
  
  if (!userId) {
    return [];
  }

  const supabase = createClientSupabaseClient();
  const today = new Date().toISOString().split("T")[0];
  
  // For daily, get today's insights
  // For weekly, get this week's insights (last 7 days)
  const startDate = type === "daily" 
    ? today 
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .gte("date", startDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching insights:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((insight) => ({
    id: insight.id,
    date: insight.date,
    title: insight.title,
    content: insight.content,
    suggestedAction: insight.suggested_action || undefined,
  }));
}

/**
 * Save an insight to Supabase
 */
export async function saveInsight(
  type: "daily" | "weekly",
  title: string,
  content: string,
  suggestedAction?: string,
  date?: string
): Promise<DailyInsight> {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("User must be authenticated to save insights");
  }

  const insightDate = date || new Date().toISOString().split("T")[0];

  const supabase = createClientSupabaseClient();
  const { data, error } = await supabase
    .from("insights")
    .insert({
      user_id: userId,
      type,
      title,
      content,
      suggested_action: suggestedAction || null,
      date: insightDate,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving insight:", error);
    throw new Error("Failed to save insight");
  }

  if (!data) {
    throw new Error("Failed to save insight");
  }

  return {
    id: data.id,
    date: data.date,
    title: data.title,
    content: data.content,
    suggestedAction: data.suggested_action || undefined,
  };
}

/**
 * Check if insights exist for today (daily) or this week (weekly)
 */
export async function hasRecentInsights(
  type: "daily" | "weekly"
): Promise<boolean> {
  const userId = await getUserId();
  
  if (!userId) {
    return false;
  }

  const supabase = createClientSupabaseClient();
  const today = new Date().toISOString().split("T")[0];
  
  const startDate = type === "daily" 
    ? today 
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("insights")
    .select("id")
    .eq("user_id", userId)
    .eq("type", type)
    .gte("date", startDate)
    .limit(1);

  if (error) {
    console.error("Error checking insights:", error);
    return false;
  }

  return (data?.length || 0) > 0;
}
