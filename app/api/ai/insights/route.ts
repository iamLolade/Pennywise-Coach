import { NextRequest, NextResponse } from "next/server";

import {
  generateInsight,
  generateFallbackInsight,
  type InsightResponseData,
} from "@/lib/ai/huggingface";
import { getInsightPrompt, PROMPT_VERSIONS } from "@/lib/ai/prompts";
import { evaluateInsight } from "@/lib/ai/evaluations";
import { generateTraceId, logTrace, logEvaluation, logSpan, categorizeError } from "@/lib/opik/client";
import { runLlmJudgeEvaluation } from "@/lib/ai/judge";
import {
  calculateTotalIncome,
  calculateTotalExpenses,
} from "@/lib/utils/transactions";
import { formatMoney } from "@/lib/utils/money";
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
      promptVersion = PROMPT_VERSIONS.v3, // Default to v3 for structured JSON
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
    const currency = userProfile.currency || "USD";
    const summary = `${transactions.length} transactions, ${formatMoney(
      totalIncome,
      currency
    )} income, ${formatMoney(totalSpent, currency)} spent, ${formatMoney(
      net,
      currency
    )} net.`;

    // Get recent transactions based on type
    const recentTransactions = type === "daily" 
      ? transactions.filter((t) => {
          const transactionDate = new Date(t.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return transactionDate >= today;
        }).slice(-10)
      : transactions.slice(-20); // Last 20 for weekly

    // Try AI generation first, fallback to rule-based if it fails
    let insight: { title: string; content: string; suggestedAction: string };
    let usedAI = false;
    let evaluationScore: number | undefined;
    let tokenUsage: { input: number; output: number } | undefined;
    let llmCallLatency = 0;
    let parseLatency = 0;
    let promptBuildLatency = 0;
    let evalLatency = 0;

    // Span 1: Prompt Build
    const promptBuildStart = Date.now();
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
    promptBuildLatency = Date.now() - promptBuildStart;
    await logSpan({
      spanName: "prompt-build",
      parentTraceId: traceId,
      metadata: {
        latency: promptBuildLatency,
        promptLength: prompt.length,
      },
    });

    try {
      // Span 2: LLM Call
      const llmCallStart = Date.now();
      const aiResponse = await generateInsight(prompt);
      llmCallLatency = Date.now() - llmCallStart;
      usedAI = true;
      
      // Extract token usage if available
      if (typeof aiResponse === "object" && "tokenUsage" in aiResponse) {
        tokenUsage = (aiResponse as any).tokenUsage;
      }
      
      await logSpan({
        spanName: "llm-call",
        parentTraceId: traceId,
        metadata: {
          latency: llmCallLatency,
          ...(tokenUsage && { tokenUsage }),
        },
      });
      
      // Span 3: Parse
      const parseStart = Date.now();
      
      // Handle structured response or plain text
      if (typeof aiResponse === "object" && "title" in aiResponse && "content" in aiResponse) {
        // Structured response
        insight = aiResponse as InsightResponseData;
      } else {
        // Plain text response - parse it
        const lines = (aiResponse as string).split("\n").filter((line) => line.trim());
        insight = {
          title: lines[0]?.replace(/^[-*]\s*/, "").trim() || "Financial insight",
          content: lines.slice(0, 2).join(" ").trim() || (aiResponse as string),
          suggestedAction: lines[lines.length - 1]?.replace(/^[-*]\s*/, "").trim() || "Keep tracking your spending to build better habits.",
        };
      }
      
      parseLatency = Date.now() - parseStart;
      
      await logSpan({
        spanName: "parse",
        parentTraceId: traceId,
        metadata: {
          latency: parseLatency,
          isStructured: typeof aiResponse === "object" && "title" in aiResponse,
        },
      });

      // Span 4: Evaluation
      const evalStart = Date.now();
      try {
        const evaluation = evaluateInsight(insight, userProfile, type);
        evaluationScore = evaluation.average;
        evalLatency = Date.now() - evalStart;
        
        await logSpan({
          spanName: "evaluation",
          parentTraceId: traceId,
          metadata: {
            latency: evalLatency,
            averageScore: evaluation.average,
            safetyFlags: evaluation.safetyFlags,
          },
        });

        // Log evaluation to Opik with promptVersion for regression tracking
        // Map insight scores to OpikEvaluation format (relevance -> helpfulness, actionability -> financialAlignment)
        await logEvaluation({
          traceId,
          scores: {
            clarity: evaluation.clarity,
            helpfulness: evaluation.relevance, // Map relevance to helpfulness for consistency
            tone: evaluation.tone,
            financialAlignment: evaluation.actionability, // Map actionability to financialAlignment for consistency
            safetyFlags: evaluation.safetyFlags,
            average: evaluation.average,
          },
          reasoning: evaluation.reasoning,
          promptVersion,
          evaluator: "heuristic",
        });

        // Optional online LLM-as-judge evaluation (enabled via OPIK_LLM_JUDGE_ENABLED)
        if (process.env.OPIK_LLM_JUDGE_ENABLED === "true") {
          const judge = await runLlmJudgeEvaluation({
            userQuestion: `Generate a ${type} insight`,
            aiResponse: `${insight.title}\n${insight.content}\nSuggested action: ${insight.suggestedAction}`,
            userProfile: {
              goals: userProfile.goals || [],
              concerns: userProfile.concerns || [],
            },
          });

          if (judge) {
            await logEvaluation({
              traceId,
              scores: {
                clarity: judge.raw.clarity * 2,
                helpfulness: judge.raw.helpfulness * 2,
                tone: judge.raw.tone * 2,
                financialAlignment: judge.raw.financialAlignment * 2,
                safetyFlags: judge.raw.safetyFlags,
                average: judge.average0to10,
              },
              reasoning: judge.raw.reasoning,
              promptVersion,
              evaluator: "llm_judge",
            });
          }
        }
      } catch (evalError) {
        console.warn("Failed to evaluate insight:", evalError);
        // Continue without evaluation
      }
    } catch (error) {
      const errorCategory = categorizeError(error);
      console.warn("AI insight generation failed, using fallback:", error);
      
      await logSpan({
        spanName: "llm-call",
        parentTraceId: traceId,
        metadata: {
          latency: llmCallLatency,
          error: {
            category: errorCategory,
            message: error instanceof Error ? error.message : String(error),
          },
        },
      });
      
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
        ...(evaluationScore !== undefined && { evaluationScore }),
        latencyBreakdown: {
          promptBuild: promptBuildLatency,
          llmCall: llmCallLatency,
          parse: parseLatency,
          evaluation: evalLatency,
        },
        ...(tokenUsage && { tokenUsage }),
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
