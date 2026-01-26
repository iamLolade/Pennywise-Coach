/**
 * Prompt templates for AI financial coach
 * Versioned for experiment tracking in Opik
 */

export const PROMPT_VERSIONS = {
  v1: "v1-baseline",
  v2: "v2-improved",
  v3: "v3-structured-json",
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

  // v2 - Improved with more structure and empathy, requesting JSON output
  return (
    basePrompt +
    `\nAnalyze their spending and respond with ONLY a valid JSON object. Do not include any text before or after the JSON. Use this exact structure:

{
  "summary": "A brief, supportive summary of their spending patterns in plain language",
  "patterns": ["Pattern 1", "Pattern 2"],
  "anomalies": ["Anomaly 1", "Anomaly 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

IMPORTANT: 
- Return ONLY the JSON object, no markdown, no code blocks, no explanation
- Use plain language (avoid financial jargon)
- Be supportive and non-judgmental
- Keep suggestions realistic and actionable
- Ensure all arrays have at least 2 items`
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
    currency?: string;
  },
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  currentQuestion: string,
  contextSummary?: string,
  recentTransactions?: Array<{
    amount: number;
    category: string;
    date: string;
    description: string;
  }>
): string {
  const currency = userProfile.currency || "USD";
  const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  const basePrompt = `You are Penny, a supportive, empathetic financial coach. Your role is to help users understand their finances in plain language and take small, achievable steps toward their goals.

User Profile:
- Income Range: ${userProfile.incomeRange}
- Financial Goals: ${userProfile.goals.join(", ")}
- Concerns: ${userProfile.concerns.join(", ")}
- Currency: ${currency}

${recentTransactions && recentTransactions.length > 0 ? `Recent Spending Context (last 7 days):
${recentTransactions
        .slice(0, 5)
        .map(
          (t) =>
            `- ${t.date}: ${currencySymbol}${Math.abs(t.amount).toFixed(2)} in ${t.category} - ${t.description}`
        )
        .join("\n")}
` : ""}

${contextSummary ? `Financial Summary: ${contextSummary}\n` : ""}

Recent Conversation (last 4 messages):
${conversationHistory
      .slice(-4)
      .map((msg) => `${msg.role === "user" ? "User" : "Coach"}: ${msg.content}`)
      .join("\n")}

User's Current Question: ${currentQuestion}`;

  if (version === PROMPT_VERSIONS.v1) {
    return basePrompt + `\nRespond helpfully and supportively.`;
  }

  // v2 - Structured JSON output for better parsing and quality
  return (
    basePrompt +
    `\n\nPlease respond with a JSON object in this exact format:
{
  "response": "Your main response to the user's question. Be direct, clear, and supportive. Use plain language. Keep it under 150 words.",
  "tone": "supportive|encouraging|practical|gentle",
  "keyPoints": ["Key point 1", "Key point 2"],
  "suggestedAction": "One specific, actionable next step the user can take (optional, only if relevant)"
}

Guidelines:
- Answer their question directly and clearly
- Use plain language (avoid financial jargon like "amortization", "liquidity", "equity" unless you explain it simply)
- Be supportive and non-judgmental (never shame or criticize)
- Reference their goals and concerns when relevant
- If they ask about spending, reference their recent transactions if provided
- Keep responses conversational, warm, and human
- Never give specific investment advice or guarantee outcomes
- Return ONLY valid JSON, no additional text or markdown`
  );
}
