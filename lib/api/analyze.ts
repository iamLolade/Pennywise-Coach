/**
 * Client-side API functions for AI analysis
 */

import type { SpendingAnalysis, Transaction, UserProfile } from "@/types";
import { PROMPT_VERSIONS } from "@/lib/ai/prompts";
import type { PromptVersion } from "@/lib/ai/prompts";

export interface AnalyzeResponse {
  analysis: SpendingAnalysis;
  traceId: string;
  promptVersion: string;
}

/**
 * Call the AI analysis API
 */
export async function analyzeSpending(
  userProfile: UserProfile,
  transactions: Transaction[],
  promptVersion: PromptVersion = PROMPT_VERSIONS.v2
): Promise<AnalyzeResponse> {
  const response = await fetch("/api/ai/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userProfile,
      transactions,
      promptVersion,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to analyze spending");
  }

  return response.json();
}
