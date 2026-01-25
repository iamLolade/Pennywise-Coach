import { NextRequest, NextResponse } from "next/server";

import {
  analyzeWithHuggingFace,
  generateFallbackAnalysis,
} from "@/lib/ai/huggingface";
import { getAnalysisPrompt, PROMPT_VERSIONS } from "@/lib/ai/prompts";
import { generateTraceId, logTrace } from "@/lib/opik/client";
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateByCategory,
} from "@/lib/utils/transactions";
import type { SpendingAnalysis, Transaction, UserProfile } from "@/types";

/**
 * Calculate financial totals from transactions
 * Used to enrich AI analysis with accurate numbers
 */
function calculateFinancialTotals(transactions: Transaction[]) {
  const totalIncome = calculateTotalIncome(transactions);
  const totalSpent = calculateTotalExpenses(transactions);
  const byCategory = calculateByCategory(transactions);

  return { totalIncome, totalSpent, byCategory };
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

    // Build prompt
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

    // Calculate financial totals for enrichment
    const { totalIncome, totalSpent, byCategory } =
      calculateFinancialTotals(transactions);

    // Try AI analysis first, fallback to rule-based if it fails
    let analysis: SpendingAnalysis;
    let usedAI = false;

    try {
      analysis = await analyzeWithHuggingFace(
        userProfile,
        transactions,
        prompt
      );
      usedAI = true;

      // Enrich AI response with accurate financial totals
      analysis.totalIncome = totalIncome;
      analysis.totalSpent = totalSpent;
      analysis.byCategory = byCategory;
    } catch (error) {
      console.warn("AI analysis failed, using fallback:", error);
      // Fallback to rule-based analysis
      analysis = generateFallbackAnalysis(userProfile, transactions);
      analysis.totalIncome = totalIncome;
      analysis.totalSpent = totalSpent;
      analysis.byCategory = byCategory;
    }

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
