/**
 * Hugging Face Inference API client for AI analysis
 * 
 * Uses the Hugging Face Inference API to generate spending analysis.
 * Make sure to set HUGGINGFACE_API_KEY in your .env.local file.
 */

import type { SpendingAnalysis, Transaction, UserProfile } from "@/types";
import { getAnalysisPrompt } from "./prompts";
import { InferenceClient } from "@huggingface/inference";

// Use a model that works reliably with HF router (per HF docs example)
const HF_MODEL_ID = "meta-llama/Llama-3.1-8B-Instruct";

function getHuggingFaceApiKey(): string {
  const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY;
  if (!apiKey) {
    throw new Error(
      "HUGGINGFACE_API_KEY is not set in environment variables"
    );
  }
  return apiKey;
}

function getHuggingFaceClient(): InferenceClient {
  return new InferenceClient(getHuggingFaceApiKey());
}

/**
 * Create a promise that rejects after a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Retry a function with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors (auth, validation)
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (
          errorMsg.includes("authentication") ||
          errorMsg.includes("unauthorized") ||
          errorMsg.includes("invalid") ||
          errorMsg.includes("not found")
        ) {
          throw error;
        }
      }

      // If this was the last attempt, throw
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s...
      const delayMs = baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

/**
 * Get a user-friendly error message from HF API errors
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes("timeout")) {
      return "The AI service is taking too long to respond. Please try again.";
    }
    if (msg.includes("authentication") || msg.includes("unauthorized")) {
      return "Authentication failed. Please check your API key.";
    }
    if (msg.includes("not found") || msg.includes("404")) {
      return "The AI model is temporarily unavailable. Please try again later.";
    }
    if (msg.includes("provider") || msg.includes("400")) {
      return "The AI service is experiencing issues. Please try again in a moment.";
    }
    if (msg.includes("rate limit") || msg.includes("429")) {
      return "Too many requests. Please wait a moment and try again.";
    }

    return "The AI service encountered an error. Please try again.";
  }

  return "An unexpected error occurred. Please try again.";
}

export interface ChatCompletionResult {
  content: string;
  tokenUsage?: {
    input: number;
    output: number;
  };
}

async function runChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  parameters: { max_new_tokens: number; temperature: number }
): Promise<ChatCompletionResult> {
  const client = getHuggingFaceClient();
  const timeoutMs = 30000; // 30 seconds timeout

  try {
    const result = await withRetry(
      () =>
        withTimeout(
          client.chatCompletion({
            model: HF_MODEL_ID,
            messages,
            max_tokens: parameters.max_new_tokens,
            temperature: parameters.temperature,
          }),
          timeoutMs
        ),
      2, // Max 2 retries (3 total attempts)
      1000 // Base delay 1s
    );

    const content = result.choices?.[0]?.message?.content;
    if (!content || content.trim().length === 0) {
      throw new Error("Received empty response from AI model");
    }

    // Extract token usage if available (HF API may include usage in response)
    const tokenUsage = (result as any).usage
      ? {
        input: (result as any).usage.prompt_tokens || 0,
        output: (result as any).usage.completion_tokens || 0,
      }
      : undefined;

    // If usage not available, estimate from message lengths (rough approximation)
    if (!tokenUsage) {
      const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0) + content.length;
      // Rough estimate: ~4 chars per token
      const estimatedInput = Math.ceil(messages.reduce((sum, m) => sum + m.content.length, 0) / 4);
      const estimatedOutput = Math.ceil(content.length / 4);
      return {
        content: content.trim(),
        tokenUsage: {
          input: estimatedInput,
          output: estimatedOutput,
        },
      };
    }

    return {
      content: content.trim(),
      tokenUsage,
    };
  } catch (error: unknown) {
    const friendlyMessage = getErrorMessage(error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Unknown error";
    console.error("Hugging Face SDK error:", {
      model: HF_MODEL_ID,
      message: errorMessage,
      friendlyMessage,
      error,
    });

    // Throw with friendly message for better UX
    throw new Error(friendlyMessage);
  }
}

/**
 * Call Hugging Face API to analyze spending
 */
export async function analyzeWithHuggingFace(
  userProfile: UserProfile,
  transactions: Transaction[],
  prompt: string
): Promise<SpendingAnalysis & { tokenUsage?: { input: number; output: number } }> {
  try {
    const result = await runChatCompletion(
      [
        {
          role: "system",
          content: "You are a helpful financial analysis assistant. Respond with the JSON format requested in the prompt.",
        },
        { role: "user", content: prompt },
      ],
      {
        max_new_tokens: 300,
        temperature: 0.7,
      }
    );

    // Parse the LLM response into SpendingAnalysis format
    const analysis = parseLLMResponse(result.content, transactions);
    return {
      ...analysis,
      ...(result.tokenUsage && { tokenUsage: result.tokenUsage }),
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Hugging Face API error:", errorMessage);
    throw error;
  }
}

/**
 * Structured coach response from AI
 */
export interface CoachResponseData {
  response: string;
  tone?: string;
  keyPoints?: string[];
  suggestedAction?: string;
}

/**
 * Call Hugging Face API for coach chat responses
 * Returns structured response if available, otherwise plain text
 */
export async function getCoachResponse(prompt: string): Promise<CoachResponseData | string> {
  try {
    const result = await runChatCompletion(
      [
        {
          role: "system",
          content: "You are a calm and responsible financial coach.",
        },
        { role: "user", content: prompt },
      ],
      {
        max_new_tokens: 300,
        temperature: 0.7,
      }
    );

    const generatedText = result.content;

    // Try to parse as JSON (for structured responses)
    try {
      // Remove markdown code blocks if present
      let cleanedText = generatedText.trim();
      cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      cleanedText = cleanedText.trim();

      // Try to extract JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate structure
        if (parsed.response && typeof parsed.response === "string") {
          return {
            response: parsed.response,
            tone: parsed.tone,
            keyPoints: parsed.keyPoints,
            suggestedAction: parsed.suggestedAction,
          } as CoachResponseData;
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, return plain text
      console.warn("Failed to parse coach response as JSON, using plain text:", parseError);
    }

    // Fallback to plain text
    return generatedText.trim();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Hugging Face API error:", errorMessage);
    throw error;
  }
}

/**
 * Parse LLM response into SpendingAnalysis format
 * 
 * The LLM should return a JSON object with the analysis.
 * We'll try multiple extraction methods to be more robust.
 */
function parseLLMResponse(
  responseText: string,
  transactions: Transaction[]
): SpendingAnalysis {
  const cleanText = (value: unknown): string => {
    if (typeof value !== "string") return "";
    let text = value.trim();
    // Remove markdown fences if the model stuffed them into fields
    text = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    // Remove a leading "json:" or similar label
    text = text.replace(/^json\s*[:\-]?\s*/i, "").trim();
    return text;
  };

  const looksLikeJsonBlob = (text: string): boolean => {
    const t = text.trim();
    return (
      (t.startsWith("{") && t.includes("}")) ||
      (t.startsWith("[") && t.includes("]")) ||
      t.includes(`"summary"`) ||
      t.includes(`"patterns"`) ||
      t.includes(`"suggestions"`)
    );
  };

  const toCleanStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value
      .filter((v) => typeof v === "string")
      .map((v) => cleanText(v))
      .filter((v) => v.length > 0)
      // Avoid showing raw JSON-looking strings in the UI
      .filter((v) => !looksLikeJsonBlob(v))
      .slice(0, 8);
  };

  // Clean the response text - remove markdown code blocks if present
  let cleanedText = responseText.trim();

  // Remove markdown code blocks (multiple patterns)
  cleanedText = cleanedText
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .replace(/^json\s*/i, "")
    .trim();

  // Try multiple JSON extraction methods
  let jsonMatch: RegExpMatchArray | null = null;

  // Method 1: Look for JSON object at the start
  jsonMatch = cleanedText.match(/^\s*\{[\s\S]*\}\s*$/);

  // Method 2: Extract first JSON object found
  if (!jsonMatch) {
    jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  }

  // Method 3: Look for JSON after common prefixes
  if (!jsonMatch) {
    const afterColon = cleanedText.split(/[:]\s*/).slice(1).join(":").trim();
    jsonMatch = afterColon.match(/\{[\s\S]*\}/);
  }

  if (!jsonMatch) {
    // Last resort: try parsing the entire cleaned text
    try {
      const parsed = JSON.parse(cleanedText);
      if (typeof parsed === "object" && parsed !== null) {
        jsonMatch = [JSON.stringify(parsed)];
      }
    } catch {
      // Will throw below
    }
  }

  if (!jsonMatch) {
    // Log the actual response for debugging (first 200 chars only to avoid spam)
    const preview = responseText.substring(0, 200);
    console.warn(
      `Could not find JSON in LLM response. Preview: ${preview}${responseText.length > 200 ? "..." : ""}`
    );
    throw new Error("Could not find JSON in LLM response");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Some models occasionally embed the whole JSON response inside a string field.
    // If that happens, try to recover the actual fields.
    let recovered: any = parsed;
    if (typeof parsed?.summary === "string" && looksLikeJsonBlob(parsed.summary)) {
      try {
        const maybe = JSON.parse(cleanText(parsed.summary));
        if (maybe && typeof maybe === "object") {
          recovered = maybe;
        }
      } catch {
        // ignore recovery
      }
    }

    // Validate and construct SpendingAnalysis
    // Note: totalSpent, totalIncome, and byCategory will be enriched by the API route
    const analysis: SpendingAnalysis = {
      totalSpent: 0, // Will be calculated and set by API route
      totalIncome: 0, // Will be calculated and set by API route
      byCategory: {}, // Will be calculated and set by API route
      patterns: toCleanStringArray(recovered?.patterns),
      anomalies: toCleanStringArray(recovered?.anomalies),
      summary:
        typeof recovered?.summary === "string" && cleanText(recovered.summary).length > 0
          ? cleanText(recovered.summary)
          : "Here’s a summary of your spending patterns.",
      suggestions: toCleanStringArray(recovered?.suggestions),
    };

    return analysis;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown parse error";
    // Log preview only (first 200 chars) to avoid spam
    const responsePreview = responseText.substring(0, 200);
    const jsonPreview = jsonMatch[0]?.substring(0, 200) || "N/A";
    console.warn(
      `Failed to parse LLM response: ${errorMessage}. Response preview: ${responsePreview}${responseText.length > 200 ? "..." : ""}. JSON preview: ${jsonPreview}${jsonMatch[0]?.length > 200 ? "..." : ""}`
    );
    throw new Error("Failed to parse LLM response as valid JSON");
  }
}

/**
 * Fallback to rule-based analysis if AI fails
 */
export function generateFallbackAnalysis(
  userProfile: UserProfile,
  transactions: Transaction[]
): SpendingAnalysis {
  const { formatMoney } = require("../utils/money") as typeof import("../utils/money");
  const currency = userProfile.currency || "USD";
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const byCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.amount < 0)
    .forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount);
    });

  const net = totalIncome - totalSpent;
  const patterns: string[] = [];
  const suggestions: string[] = [];

  // Add patterns
  if (net > 0) {
    patterns.push(
      `You're saving ${formatMoney(net, currency)} this period, which is great progress!`
    );
  } else {
    patterns.push(
      `You're spending ${formatMoney(Math.abs(net), currency)} more than you're earning.`
    );
  }

  // Add suggestions based on goals
  if (userProfile.goals.includes("reduce-spending") && totalSpent > 0) {
    const topCategory = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)[0];
    if (topCategory) {
      suggestions.push(
        `Consider reducing spending in ${topCategory[0].toLowerCase()} by 10-15% to free up funds.`
      );
    }
  }

  if (userProfile.goals.includes("build-emergency-fund")) {
    if (net > 0) {
      suggestions.push(
        `You're saving ${formatMoney(net, currency)} per period. Consider setting aside ${formatMoney(net * 0.5, currency)} for your emergency fund.`
      );
    } else {
      suggestions.push(
        `To build an emergency fund, try to reduce expenses by about ${formatMoney(Math.abs(net) + 100, currency)} per period.`
      );
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Keep tracking your spending to identify areas for improvement."
    );
  }

  return {
    totalSpent,
    totalIncome,
    byCategory,
    patterns,
    anomalies: [],
    summary: `Based on your ${transactions.length} transactions, you've earned ${formatMoney(totalIncome, currency)} and spent ${formatMoney(totalSpent, currency)}.`,
    suggestions,
  };
}

/**
 * Structured insight response from AI
 */
export interface InsightResponseData {
  title: string;
  content: string;
  suggestedAction: string;
}

/**
 * Call Hugging Face API for daily/weekly insights generation
 * Returns structured response if available, otherwise plain text
 */
export async function generateInsight(prompt: string): Promise<InsightResponseData | string> {
  try {
    const result = await runChatCompletion(
      [
        {
          role: "system",
          content: "You are a supportive financial coach. Provide concise, actionable insights in the JSON format requested.",
        },
        { role: "user", content: prompt },
      ],
      {
        max_new_tokens: 300,
        temperature: 0.8,
      }
    );

    const generatedText = result.content;

    // Try to parse as JSON (for structured responses)
    try {
      const { sanitizeModelField, stripMarkdownCodeFences } = require("../utils/text") as typeof import("../utils/text");

      // Remove markdown code blocks if present (robust)
      let cleanedText = stripMarkdownCodeFences(generatedText.trim());

      // Try to extract JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const maybe = (parsed && typeof parsed === "object" ? parsed : null) as any;
        const root = maybe?.financial_insight && typeof maybe.financial_insight === "object"
          ? maybe.financial_insight
          : maybe;

        // Validate structure
        if (
          root?.title &&
          root?.content &&
          root?.suggestedAction &&
          typeof root.title === "string" &&
          typeof root.content === "string" &&
          typeof root.suggestedAction === "string"
        ) {
          return {
            title: sanitizeModelField(root.title) || "Financial insight",
            content: sanitizeModelField(root.content) || "Here’s a quick insight based on your recent activity.",
            suggestedAction: sanitizeModelField(root.suggestedAction) || "Keep tracking your spending to build better habits.",
          } as InsightResponseData;
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, return plain text
      console.warn("Failed to parse insight response as JSON, using plain text:", parseError);
    }

    // Fallback to plain text
    const { stripMarkdownCodeFences } = require("../utils/text") as typeof import("../utils/text");
    return stripMarkdownCodeFences(generatedText.trim());
  } catch (error: unknown) {
    // Error already logged in runChatCompletion
    throw error;
  }
}

/**
 * Fallback coach response if AI fails
 */
export function generateFallbackCoachResponse(
  userProfile: UserProfile,
  question: string
): string {
  // Simple rule-based responses based on keywords
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("budget") || lowerQuestion.includes("spending")) {
    return `I can help you understand your spending patterns. Based on your goals of ${userProfile.goals.join(", ")}, I'd suggest tracking your expenses regularly and identifying areas where you can make small adjustments. Every little bit helps!`;
  }

  if (lowerQuestion.includes("save") || lowerQuestion.includes("emergency")) {
    return `Building savings takes time and consistency. Start by setting aside a small amount regularly, even if it's just a few dollars. Over time, these small contributions add up. You've got this!`;
  }

  if (lowerQuestion.includes("debt")) {
    return `Managing debt can feel overwhelming, but you're taking the right steps by seeking help. Consider focusing on paying off high-interest debt first, and remember that progress, no matter how small, is still progress.`;
  }

  return `I'm here to help you with your financial journey. Based on your goals and concerns, I'd suggest starting with small, achievable steps. Remember, financial wellness is a journey, not a destination. What specific area would you like to focus on?`;
}

/**
 * Fallback insight generation if AI fails
 */
export function generateFallbackInsight(
  userProfile: UserProfile,
  transactions: Transaction[],
  type: "daily" | "weekly"
): { title: string; content: string; suggestedAction: string } {
  const { formatMoney } = require("../utils/money") as typeof import("../utils/money");
  const currency = userProfile.currency || "USD";
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  const net = totalIncome - totalSpent;

  if (type === "daily") {
    if (net > 0) {
      return {
        title: "You're on track today",
        content: `You've spent ${formatMoney(totalSpent, currency)} today while earning ${formatMoney(totalIncome, currency)}. That's a positive balance of ${formatMoney(net, currency)}.`,
        suggestedAction: "Consider setting aside a portion of today's surplus for your savings goals.",
      };
    } else {
      return {
        title: "Today's spending overview",
        content: `You've spent ${formatMoney(totalSpent, currency)} today. Tracking your expenses is the first step to better financial awareness.`,
        suggestedAction: "Review your transactions to identify any non-essential purchases you could reduce tomorrow.",
      };
    }
  } else {
    // Weekly
    if (net > 0) {
      return {
        title: "Positive week ahead",
        content: `This week you've earned ${formatMoney(totalIncome, currency)} and spent ${formatMoney(totalSpent, currency)}, leaving you with ${formatMoney(net, currency)}. That's progress!`,
        suggestedAction: "Consider allocating a portion of this week's surplus toward your financial goals.",
      };
    } else {
      return {
        title: "Weekly spending pattern",
        content: `This week you've spent ${formatMoney(totalSpent, currency)} across ${transactions.filter((t) => t.amount < 0).length} transactions. Understanding your patterns helps you make better decisions.`,
        suggestedAction: "Look for one category where you can reduce spending by 10% next week.",
      };
    }
  }
}
