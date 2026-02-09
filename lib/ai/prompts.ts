/**
 * Prompt templates for AI financial coach
 * Versioned for experiment tracking in Opik
 */

export const PROMPT_VERSIONS = {
  v1: "v1-baseline",
  v2: "v2-improved",
  v3: "v3-structured-json", // Structured JSON output for coach and insights
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
    currency?: string;
  },
  transactions: Array<{
    amount: number;
    category: string;
    date: string;
    description: string;
  }>,
  userQuestion?: string
): string {
  // Humanize profile fields so the model sees real labels (not internal IDs)
  // and format amounts in the user's currency for better grounding.
  const { humanizeProfileForPrompt } = require("./profileHumanizer") as typeof import("./profileHumanizer");
  const { formatMoney } = require("../utils/money") as typeof import("../utils/money");

  const { currency, incomeRangeLabel, goalsLabels, concernsLabels } =
    humanizeProfileForPrompt(userProfile);

  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  const net = totalIncome - totalSpent;

  const spendByCategory: Record<string, number> = {};
  for (const t of transactions) {
    if (t.amount < 0) {
      spendByCategory[t.category] =
        (spendByCategory[t.category] || 0) + Math.abs(t.amount);
    }
  }
  const topSpendCategories = Object.entries(spendByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category, amount]) => ({
      category,
      amount,
      sharePct: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
    }));

  const basePrompt = `You are a supportive, non-judgmental financial coach helping someone understand their spending and make better financial decisions.

User Profile:
- Income Range: ${incomeRangeLabel}
- Goals: ${goalsLabels.join(", ") || "Not provided"}
- Concerns: ${concernsLabels.join(", ") || "Not provided"}
- Currency: ${currency}

Quick Summary (computed from transactions):
- Total income: ${formatMoney(totalIncome, currency)}
- Total spent: ${formatMoney(totalSpent, currency)}
- Net: ${formatMoney(net, currency)}
- Top spend categories: ${
    topSpendCategories.length > 0
      ? topSpendCategories
          .map(
            (c) =>
              `${c.category} (${formatMoney(c.amount, currency)} ~${c.sharePct}%)`
          )
          .join(", ")
      : "Not enough data yet"
  }

Recent Transactions:
${transactions
      .map(
        (t) =>
          `- ${t.date}: ${formatMoney(Math.abs(t.amount), currency, { maximumFractionDigits: 2 })} in ${t.category} - ${t.description}`
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
- Ensure all arrays have at least 2 items
- Ground your patterns/suggestions in the Quick Summary and transactions (mention categories/amounts when helpful)`
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
    currency?: string;
  },
  recentTransactions: Array<{
    amount: number;
    category: string;
    date: string;
  }>,
  summary: string
): string {
  const { humanizeProfileForPrompt } = require("./profileHumanizer") as typeof import("./profileHumanizer");
  const { formatMoney } = require("../utils/money") as typeof import("../utils/money");
  const { currency, incomeRangeLabel, goalsLabels, concernsLabels } =
    humanizeProfileForPrompt(userProfile);

  const basePrompt = `Generate a short, encouraging ${version === PROMPT_VERSIONS.v2 || version === PROMPT_VERSIONS.v3 ? "" : ""}financial insight for this user.

User Profile:
- Income Range: ${incomeRangeLabel}
- Goals: ${goalsLabels.join(", ") || "Not provided"}
- Concerns: ${concernsLabels.join(", ") || "Not provided"}
- Currency: ${currency}

Recent Activity Summary: ${summary}

Recent Transactions (last 3 days):
${recentTransactions
      .slice(-3)
      .map(
        (t) =>
          `- ${t.date}: ${formatMoney(Math.abs(t.amount), currency, { maximumFractionDigits: 2 })} in ${t.category}`
      )
      .join("\n")}`;

  if (version === PROMPT_VERSIONS.v1) {
    return basePrompt + `\nProvide a brief, helpful insight.`;
  }

  if (version === PROMPT_VERSIONS.v2) {
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

  // v3 - Structured JSON output
  return (
    basePrompt +
    `\nRespond with ONLY a valid JSON object. Do not include any text before or after the JSON. Use this exact structure:

{
  "title": "A short, encouraging title (max 8 words)",
  "content": "A brief, supportive insight about their financial behavior (2-3 sentences)",
  "suggestedAction": "One clear, actionable next step (1 sentence)"
}

IMPORTANT:
- Return ONLY the JSON object, no markdown, no code blocks, no explanation
- Use a warm, supportive, non-judgmental tone
- Focus on positive observations and gentle guidance
- Keep content concise (under 100 words total)
- Ensure the suggestedAction is specific and achievable
- Never give investment advice or make guarantees`
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
  const { humanizeProfileForPrompt } = require("./profileHumanizer") as typeof import("./profileHumanizer");
  const { formatMoney } = require("../utils/money") as typeof import("../utils/money");
  const { currency, incomeRangeLabel, goalsLabels, concernsLabels } =
    humanizeProfileForPrompt(userProfile);

  const basePrompt = `You are Penny, a supportive, empathetic financial coach. Your role is to help users understand their finances in plain language and take small, achievable steps toward their goals.

User Profile:
- Income Range: ${incomeRangeLabel}
- Financial Goals: ${goalsLabels.join(", ") || "Not provided"}
- Concerns: ${concernsLabels.join(", ") || "Not provided"}
- Currency: ${currency}

${recentTransactions && recentTransactions.length > 0 ? `Recent Spending Context (last 7 days):
${recentTransactions
        .slice(0, 5)
        .map(
          (t) =>
            `- ${t.date}: ${formatMoney(Math.abs(t.amount), currency, { maximumFractionDigits: 2 })} in ${t.category} - ${t.description}`
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
