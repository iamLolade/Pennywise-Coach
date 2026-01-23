import { NextRequest, NextResponse } from "next/server";

import { getAnalysisPrompt, PROMPT_VERSIONS } from "@/lib/ai/prompts";
import { generateTraceId, logTrace } from "@/lib/opik/client";
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateByCategory,
  getTopCategories,
} from "@/lib/utils/transactions";
import type { SpendingAnalysis, Transaction, UserProfile } from "@/types";

/**
 * Generate AI-powered spending analysis
 * 
 * For MVP, this uses rule-based analysis. In production, this would call
 * an LLM API (OpenAI, Anthropic, etc.) with the prompt from lib/ai/prompts.ts
 */
function generateAnalysis(
  userProfile: UserProfile,
  transactions: Transaction[]
): SpendingAnalysis {
  const totalIncome = calculateTotalIncome(transactions);
  const totalSpent = calculateTotalExpenses(transactions);
  const byCategory = calculateByCategory(transactions);
  const topCategories = getTopCategories(byCategory, 5);

  // Calculate patterns
  const patterns: string[] = [];
  const anomalies: string[] = [];

  // Pattern: High spending in a category
  const topCategory = topCategories[0];
  if (topCategory && topCategory.amount > totalSpent * 0.3) {
    patterns.push(
      `You're spending ${Math.round((topCategory.amount / totalSpent) * 100)}% of your expenses on ${topCategory.category.toLowerCase()}.`
    );
  }

  // Pattern: Multiple dining transactions
  const diningCount = transactions.filter(
    (t) => t.category === "Dining" && t.amount < 0
  ).length;
  if (diningCount > 10) {
    patterns.push(
      `You have ${diningCount} dining transactions, which suggests frequent eating out.`
    );
  }

  // Pattern: Net positive/negative
  const net = totalIncome - totalSpent;
  if (net > 0) {
    patterns.push(
      `You're saving $${Math.round(net)} this period, which is great progress!`
    );
  } else {
    patterns.push(
      `You're spending $${Math.abs(Math.round(net))} more than you're earning.`
    );
  }

  // Anomaly: Large single transaction
  const largeTransactions = transactions.filter(
    (t) => t.amount < 0 && Math.abs(t.amount) > totalSpent * 0.15
  );
  if (largeTransactions.length > 0) {
    anomalies.push(
      `You have ${largeTransactions.length} unusually large transaction(s) that stand out.`
    );
  }

  // Generate summary
  const summary = `Based on your ${transactions.length} transactions, you've earned $${Math.round(totalIncome)} and spent $${Math.round(totalSpent)}. Your top spending category is ${topCategory?.category || "N/A"}.`;

  // Generate suggestions based on user goals and concerns
  const suggestions: string[] = [];

  if (userProfile.goals.includes("reduce-spending")) {
    if (topCategory) {
      suggestions.push(
        `Consider reducing spending in ${topCategory.category.toLowerCase()} by 10-15% to free up funds.`
      );
    }
  }

  if (userProfile.goals.includes("build-emergency-fund")) {
    const monthlySavings = net;
    if (monthlySavings > 0) {
      suggestions.push(
        `You're saving $${Math.round(monthlySavings)} per period. Consider setting aside $${Math.round(monthlySavings * 0.5)} for your emergency fund.`
      );
    } else {
      suggestions.push(
        `To build an emergency fund, try to reduce expenses by $${Math.abs(Math.round(monthlySavings)) + 100} per period.`
      );
    }
  }

  if (userProfile.concerns.includes("overspending")) {
    if (diningCount > 8) {
      suggestions.push(
        `You're eating out frequently. Try meal planning to reduce dining expenses by 20-30%.`
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
    anomalies,
    summary,
    suggestions,
  };
}

/**
 * POST /api/ai/analyze
 * 
 * Analyzes user transactions and returns spending analysis
 */
export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const traceId = generateTraceId();

    const body = await request.json();
    const { userProfile, transactions, promptVersion = PROMPT_VERSIONS.v2 } =
      body;

    // Validate input
    if (!userProfile || !transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: "Missing required fields: userProfile, transactions" },
        { status: 400 }
      );
    }

    // Generate analysis
    const analysis = generateAnalysis(userProfile, transactions);

    // Build prompt (for logging and future LLM integration)
    const prompt = getAnalysisPrompt(
      promptVersion,
      userProfile,
      transactions.map((t) => ({
        amount: t.amount,
        category: t.category,
        date: t.date,
        description: t.description,
      }))
    );

    // Log trace to Opik
    const latency = Date.now() - startTime;
    await logTrace({
      traceId,
      experimentName: "spending-analysis",
      promptVersion,
      input: {
        userProfile,
        transactions,
      },
      output: {
        response: analysis.summary,
        suggestedActions: analysis.suggestions,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        latency,
      },
    });

    return NextResponse.json({
      analysis,
      traceId,
      promptVersion,
    });
  } catch (error) {
    console.error("Error in /api/ai/analyze:", error);
    return NextResponse.json(
      { error: "Failed to analyze spending" },
      { status: 500 }
    );
  }
}
