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
