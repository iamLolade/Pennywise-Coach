/**
 * Prompt templates for AI financial coach
 * Versioned for experiment tracking in Opik
 */

export const PROMPT_VERSIONS = {
  v1: "v1-baseline",
  v2: "v2-improved",
} as const;

export type PromptVersion = (typeof PROMPT_VERSIONS)[keyof typeof PROMPT_VERSIONS];

/**
 * Main analysis prompt - analyzes spending and provides guidance
 */
export function getAnalysisPrompt(
  version: PromptVersion,
  userProfile: {
    incomeRange: string;
    goals: string[];
    concerns: string[];
  },
  transactions: Array<{
    amount: number;
    category: string;
    date: string;
    description: string;
  }>,
  userQuestion?: string
): string {
  const basePrompt = `You are a supportive, non-judgmental financial coach helping someone understand their spending and make better financial decisions.

User Profile:
- Income Range: ${userProfile.incomeRange}
- Goals: ${userProfile.goals.join(", ")}
- Concerns: ${userProfile.concerns.join(", ")}

Recent Transactions:
${transactions
  .map(
    (t) =>
      `- ${t.date}: $${Math.abs(t.amount).toFixed(2)} in ${t.category} - ${t.description}`
  )
  .join("\n")}

${userQuestion ? `User Question: ${userQuestion}\n` : ""}`;

  if (version === PROMPT_VERSIONS.v1) {
    return (
      basePrompt +
      `\nAnalyze their spending patterns and provide helpful guidance. Be clear, supportive, and practical.`
    );
  }

  // v2 - Improved with more structure and empathy
  return (
    basePrompt +
    `\nPlease provide:
1. A brief summary of their spending patterns (what stands out)
2. An explanation in plain language (avoid financial jargon)
3. One or two specific, realistic suggestions for improvement
4. A supportive tone that reduces anxiety rather than increases it

Remember: Focus on understanding and small, achievable steps. Never shame or judge.`
  );
}

/**
 * Daily insight generation prompt
 */
export function getInsightPrompt(
  version: PromptVersion,
  userProfile: {
    incomeRange: string;
    goals: string[];
    concerns: string[];
  },
  recentTransactions: Array<{
    amount: number;
    category: string;
    date: string;
  }>,
  summary: string
): string {
  const basePrompt = `Generate a short, encouraging daily financial insight for this user.

User Profile:
- Income Range: ${userProfile.incomeRange}
- Goals: ${userProfile.goals.join(", ")}
- Concerns: ${userProfile.concerns.join(", ")}

Recent Activity Summary: ${summary}

Recent Transactions (last 3 days):
${recentTransactions
  .slice(-3)
  .map((t) => `- ${t.date}: $${Math.abs(t.amount).toFixed(2)} in ${t.category}`)
  .join("\n")}`;

  if (version === PROMPT_VERSIONS.v1) {
    return basePrompt + `\nProvide a brief, helpful insight.`;
  }

  // v2 - More structured and actionable
  return (
    basePrompt +
    `\nProvide:
- One positive observation about their financial behavior
- One gentle suggestion or reminder
- Keep it under 3 sentences
- Use a warm, supportive tone`
  );
}

/**
 * Coach response prompt (for chat interface)
 */
export function getCoachPrompt(
  version: PromptVersion,
  userProfile: {
    incomeRange: string;
    goals: string[];
    concerns: string[];
  },
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  currentQuestion: string,
  contextSummary?: string
): string {
  const basePrompt = `You are a supportive financial coach in a conversation with a user.

User Profile:
- Income Range: ${userProfile.incomeRange}
- Goals: ${userProfile.goals.join(", ")}
- Concerns: ${userProfile.concerns.join(", ")}

${contextSummary ? `Context: ${contextSummary}\n` : ""}

Recent Conversation:
${conversationHistory
  .slice(-4)
  .map((msg) => `${msg.role === "user" ? "User" : "Coach"}: ${msg.content}`)
  .join("\n")}

User's Current Question: ${currentQuestion}`;

  if (version === PROMPT_VERSIONS.v1) {
    return basePrompt + `\nRespond helpfully and supportively.`;
  }

  // v2 - More conversational and structured
  return (
    basePrompt +
    `\nRespond as a helpful financial coach:
- Answer their question directly and clearly
- Use plain language (avoid jargon)
- Be supportive and non-judgmental
- If appropriate, suggest one actionable next step
- Keep your response conversational and under 150 words`
  );
}
