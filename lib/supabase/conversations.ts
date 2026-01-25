/**
 * Coach conversation operations with Supabase
 */

import { createClientSupabaseClient } from "./auth-client";
import type { CoachMessage } from "@/types";

/**
 * Get the authenticated user ID from Supabase Auth
 */
async function getUserId(): Promise<string | null> {
  const supabase = createClientSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Get conversation history from Supabase
 */
export async function getConversationHistory(limit: number = 50): Promise<CoachMessage[]> {
  const userId = await getUserId();
  
  if (!userId) {
    return [];
  }

  const supabase = createClientSupabaseClient();
  const { data, error } = await supabase
    .from("coach_conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching conversation history:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
    timestamp: msg.created_at,
  }));
}

/**
 * Save a message to the conversation history
 */
export async function saveMessage(
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("User must be authenticated to save messages");
  }

  const supabase = createClientSupabaseClient();
  const { error } = await supabase
    .from("coach_conversations")
    .insert({
      user_id: userId,
      role,
      content,
    });

  if (error) {
    console.error("Error saving message:", error);
    throw new Error("Failed to save message");
  }
}

/**
 * Clear conversation history for the current user
 */
export async function clearConversationHistory(): Promise<void> {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("User must be authenticated to clear messages");
  }

  const supabase = createClientSupabaseClient();
  const { error } = await supabase
    .from("coach_conversations")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error clearing conversation history:", error);
    throw new Error("Failed to clear conversation history");
  }
}
