import { NextRequest, NextResponse } from "next/server";

import {
  generateInsight,
  generateFallbackInsight,
} from "@/lib/ai/huggingface";
import { getInsightPrompt, PROMPT_VERSIONS } from "@/lib/ai/prompts";
import { generateTraceId, logTrace } from "@/lib/opik/client";
import {
  calculateTotalIncome,
  calculateTotalExpenses,
} from "@/lib/utils/transactions";
import type { Transaction, UserProfile } from "@/types";

/**
 * POST /api/ai/insights
 * 
 * Generates daily or weekly financial insights
 */
export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const traceId = generateTraceId();

    const body = await request.json();
    const {
      userProfile,
      transactions,
      type = "daily", // "daily" or "weekly"
      promptVersion = PROMPT_VERSIONS.v2,
    } = body;

    // Validate input
    if (!userProfile || !transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: "Missing required fields: userProfile, transactions" },
        { status: 400 }
      );
    }

    if (type !== "daily" && type !== "weekly") {
      return NextResponse.json(
        { error: "Type must be 'daily' or 'weekly'" },
        { status: 400 }
      );
    }

    // Calculate summary for context
    const totalIncome = calculateTotalIncome(transactions);
    const totalSpent = calculateTotalExpenses(transactions);
    const net = totalIncome - totalSpent;
    const summary = `${transactions.length} transactions, $${Math.round(totalIncome)} income, $${Math.round(totalSpent)} spent, $${Math.round(net)} net.`;

    // Get recent transactions based on type
    const recentTransactions = type === "daily" 
      ? transactions.filter((t) => {
          const transactionDate = new Date(t.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return transactionDate >= today;
        }).slice(-10)
      : transactions.slice(-20); // Last 20 for weekly

    // Build prompt
    const prompt = getInsightPrompt(
      promptVersion,
      userProfile,
      recentTransactions.map((t) => ({
        amount: t.amount,
        category: t.category,
        date: t.date,
      })),
      summary
    );

    // Try AI generation first, fallback to rule-based if it fails
    let insight: { title: string; content: string; suggestedAction: string };
    let usedAI = false;

    try {
      const aiResponse = await generateInsight(prompt);
      usedAI = true;

      // Parse AI response - try to extract structured data
      // For now, we'll use the full response as content and generate title/action
      const lines = aiResponse.split("\n").filter((line) => line.trim());
      
      insight = {
        title: lines[0]?.replace(/^[-*]\s*/, "").trim() || "Financial insight",
        content: lines.slice(0, 2).join(" ").trim() || aiResponse,
        suggestedAction: lines[lines.length - 1]?.replace(/^[-*]\s*/, "").trim() || "Keep tracking your spending to build better habits.",
      };
    } catch (error) {
      console.warn("AI insight generation failed, using fallback:", error);
      // Fallback to rule-based insight
      insight = generateFallbackInsight(userProfile, transactions, type);
    }

    // Log trace to Opik
    const latency = Date.now() - startTime;
    await logTrace({
      traceId,
      experimentName: "insights-generation",
      promptVersion,
      input: {
        userProfile,
        transactions: recentTransactions,
        type,
      },
      output: {
        insight,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        latency,
        usedAI,
        type,
      },
    });

    return NextResponse.json({
      insight,
      traceId,
      promptVersion,
    });
  } catch (error) {
    console.error("Error in /api/ai/insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insight" },
      { status: 500 }
    );
  }
}
