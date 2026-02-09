/**
 * Client-side utility to call the insights API route
 */

import { PROMPT_VERSIONS, type PromptVersion } from "@/lib/ai/prompts";
import type { Transaction, UserProfile } from "@/types";

export interface InsightResponse {
  insight: {
    title: string;
    content: string;
    suggestedAction: string;
  };
  traceId: string;
  promptVersion: string;
}

/**
 * Generate a daily or weekly insight
 */
export async function generateInsight(
  userProfile: UserProfile,
  transactions: Transaction[],
  type: "daily" | "weekly" = "daily",
  promptVersion: PromptVersion = PROMPT_VERSIONS.v3
): Promise<InsightResponse> {
  const response = await fetch("/api/ai/insights", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userProfile,
      transactions,
      type,
      promptVersion,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to generate insight");
  }

  return response.json();
}
