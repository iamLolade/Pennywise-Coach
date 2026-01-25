/**
 * Hugging Face Inference API client for AI analysis
 * 
 * Uses the Hugging Face Inference API to generate spending analysis.
 * Make sure to set HUGGINGFACE_API_KEY in your .env.local file.
 */

import type { SpendingAnalysis, Transaction, UserProfile } from "@/types";
import { getAnalysisPrompt } from "./prompts";

const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models";
const MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2"; // Free, good for structured output

interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

/**
 * Call Hugging Face API to analyze spending
 */
export async function analyzeWithHuggingFace(
  userProfile: UserProfile,
  transactions: Transaction[],
  prompt: string
): Promise<SpendingAnalysis> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not set in environment variables");
  }

  try {
    const response = await fetch(`${HUGGINGFACE_API_URL}/${MODEL_NAME}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Hugging Face API error: ${response.status} - ${errorData.error || response.statusText}`
      );
    }

    const data: HuggingFaceResponse | HuggingFaceResponse[] = await response.json();

    // Handle array response (some models return arrays)
    const result = Array.isArray(data) ? data[0] : data;

    if (result.error) {
      throw new Error(`Hugging Face API error: ${result.error}`);
    }

    const generatedText = result.generated_text || "";

    // Parse the LLM response into SpendingAnalysis format
    return parseLLMResponse(generatedText, transactions);
  } catch (error) {
    console.error("Hugging Face API error:", error);
    throw error;
  }
}

/**
 * Call Hugging Face API for coach chat responses
 */
export async function getCoachResponse(prompt: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not set in environment variables");
  }

  try {
    const response = await fetch(`${HUGGINGFACE_API_URL}/${MODEL_NAME}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.8,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Hugging Face API error: ${response.status} - ${errorData.error || response.statusText}`
      );
    }

    const data: HuggingFaceResponse | HuggingFaceResponse[] = await response.json();

    // Handle array response (some models return arrays)
    const result = Array.isArray(data) ? data[0] : data;

    if (result.error) {
      throw new Error(`Hugging Face API error: ${result.error}`);
    }

    const generatedText = result.generated_text || "";

    // Clean up the response - remove any markdown or extra formatting
    return generatedText.trim();
  } catch (error) {
    console.error("Hugging Face API error:", error);
    throw error;
  }
}

/**
 * Parse LLM response into SpendingAnalysis format
 * 
 * The LLM should return a JSON object with the analysis.
 * We'll try to extract it from the response text.
 */
function parseLLMResponse(
  responseText: string,
  transactions: Transaction[]
): SpendingAnalysis {
  // Clean the response text - remove markdown code blocks if present
  let cleanedText = responseText.trim();

  // Remove markdown code blocks
  cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  cleanedText = cleanedText.trim();

  // Try to extract JSON from the response
  let jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not find JSON in LLM response");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and construct SpendingAnalysis
    // Note: totalSpent, totalIncome, and byCategory will be enriched by the API route
    const analysis: SpendingAnalysis = {
      totalSpent: 0, // Will be calculated and set by API route
      totalIncome: 0, // Will be calculated and set by API route
      byCategory: {}, // Will be calculated and set by API route
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
      anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies : [],
      summary: parsed.summary || "Analysis generated successfully.",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };

    return analysis;
  } catch (error) {
    console.error("Failed to parse LLM response:", error);
    console.error("Response text:", responseText);
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
      `You're saving $${Math.round(net)} this period, which is great progress!`
    );
  } else {
    patterns.push(
      `You're spending $${Math.abs(Math.round(net))} more than you're earning.`
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
        `You're saving $${Math.round(net)} per period. Consider setting aside $${Math.round(net * 0.5)} for your emergency fund.`
      );
    } else {
      suggestions.push(
        `To build an emergency fund, try to reduce expenses by $${Math.abs(Math.round(net)) + 100} per period.`
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
    summary: `Based on your ${transactions.length} transactions, you've earned $${Math.round(totalIncome)} and spent $${Math.round(totalSpent)}.`,
    suggestions,
  };
}

/**
 * Call Hugging Face API for daily/weekly insights generation
 */
export async function generateInsight(prompt: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not set in environment variables");
  }

  try {
    const response = await fetch(`${HUGGINGFACE_API_URL}/${MODEL_NAME}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.8,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Hugging Face API error: ${response.status} - ${errorData.error || response.statusText}`
      );
    }

    const data: HuggingFaceResponse | HuggingFaceResponse[] = await response.json();

    // Handle array response (some models return arrays)
    const result = Array.isArray(data) ? data[0] : data;

    if (result.error) {
      throw new Error(`Hugging Face API error: ${result.error}`);
    }

    const generatedText = result.generated_text || "";

    // Clean up the response
    return generatedText.trim();
  } catch (error) {
    console.error("Hugging Face API error:", error);
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
        content: `You've spent $${Math.round(totalSpent)} today while earning $${Math.round(totalIncome)}. That's a positive balance of $${Math.round(net)}.`,
        suggestedAction: "Consider setting aside a portion of today's surplus for your savings goals.",
      };
    } else {
      return {
        title: "Today's spending overview",
        content: `You've spent $${Math.round(totalSpent)} today. Tracking your expenses is the first step to better financial awareness.`,
        suggestedAction: "Review your transactions to identify any non-essential purchases you could reduce tomorrow.",
      };
    }
  } else {
    // Weekly
    if (net > 0) {
      return {
        title: "Positive week ahead",
        content: `This week you've earned $${Math.round(totalIncome)} and spent $${Math.round(totalSpent)}, leaving you with $${Math.round(net)}. That's progress!`,
        suggestedAction: "Consider allocating a portion of this week's surplus toward your financial goals.",
      };
    } else {
      return {
        title: "Weekly spending pattern",
        content: `This week you've spent $${Math.round(totalSpent)} across ${transactions.filter((t) => t.amount < 0).length} transactions. Understanding your patterns helps you make better decisions.`,
        suggestedAction: "Look for one category where you can reduce spending by 10% next week.",
      };
    }
  }
}
