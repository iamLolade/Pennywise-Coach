/**
 * Client-side utility to call the coach API route
 */

import { getCoachPrompt, PROMPT_VERSIONS, type PromptVersion } from "@/lib/ai/prompts";
import type { CoachMessage, UserProfile } from "@/types";

export interface CoachResponse {
  response: string;
  traceId: string;
  promptVersion: string;
}

/**
 * Send a message to the coach and get a response
 */
export async function sendCoachMessage(
  userProfile: UserProfile,
  conversationHistory: CoachMessage[],
  currentQuestion: string,
  promptVersion: PromptVersion = PROMPT_VERSIONS.v2
): Promise<CoachResponse> {
  const response = await fetch("/api/ai/coach", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userProfile,
      conversationHistory,
      currentQuestion,
      promptVersion,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to get coach response");
  }

  return response.json();
}
