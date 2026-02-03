import { NextRequest, NextResponse } from "next/server";

import {
  getCoachResponse,
  generateFallbackCoachResponse,
  type CoachResponseData,
} from "@/lib/ai/huggingface";
import { getCoachPrompt, PROMPT_VERSIONS } from "@/lib/ai/prompts";
import { evaluateCoachResponse } from "@/lib/ai/evaluations";
import { generateTraceId, logTrace, logEvaluation, logSpan, categorizeError } from "@/lib/opik/client";
import { runLlmJudgeEvaluation } from "@/lib/ai/judge";
import { getTransactions } from "@/lib/supabase/transactions";
import type { UserProfile } from "@/types";

/**
 * POST /api/ai/coach
 * 
 * Handles coach chat messages and returns AI responses
 */
export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const traceId = generateTraceId();

    const body = await request.json();
    const {
      userProfile,
      conversationHistory,
      currentQuestion,
      contextSummary,
      promptVersion = PROMPT_VERSIONS.v3,
      includeTransactions = false,
    } = body;

    // Validate input
    if (!userProfile || !currentQuestion) {
      return NextResponse.json(
        { error: "Missing required fields: userProfile, currentQuestion" },
        { status: 400 }
      );
    }

    // Optionally fetch recent transactions for context
    let recentTransactions: Array<{
      amount: number;
      category: string;
      date: string;
      description: string;
    }> | undefined;
    
    if (includeTransactions) {
      try {
        const allTransactions = await getTransactions();
        // Get last 7 days of transactions
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        recentTransactions = allTransactions
          .filter((t) => new Date(t.date) >= sevenDaysAgo)
          .slice(0, 10)
          .map((t) => ({
            amount: t.amount,
            category: t.category,
            date: t.date,
            description: t.description,
          }));
      } catch (error) {
        console.warn("Failed to fetch transactions for coach context:", error);
        // Continue without transactions
      }
    }

    // Span 1: Prompt Build
    const promptBuildStart = Date.now();
    const prompt = getCoachPrompt(
      promptVersion,
      userProfile,
      conversationHistory || [],
      currentQuestion,
      contextSummary || undefined,
      recentTransactions
    );
    const promptBuildLatency = Date.now() - promptBuildStart;
    await logSpan({
      spanName: "prompt-build",
      parentTraceId: traceId,
      metadata: {
        latency: promptBuildLatency,
        promptLength: prompt.length,
      },
    });

    // Try AI response first, fallback to rule-based if it fails
    let response: string;
    let responseData: CoachResponseData | null = null;
    let usedAI = false;
    let tokenUsage: { input: number; output: number } | undefined;
    let llmCallLatency = 0;
    let parseLatency = 0;

    try {
      // Span 2: LLM Call
      const llmCallStart = Date.now();
      const aiResponse = await getCoachResponse(prompt);
      llmCallLatency = Date.now() - llmCallStart;
      usedAI = true;
      
      // Extract token usage if available (from result object if it has tokenUsage)
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

      // Handle structured response
      if (typeof aiResponse === "object" && "response" in aiResponse) {
        responseData = aiResponse;
        response = aiResponse.response;
      } else {
        // Plain text response
        response = typeof aiResponse === "string" ? aiResponse : String(aiResponse);
      }
      parseLatency = Date.now() - parseStart;
      
      await logSpan({
        spanName: "parse",
        parentTraceId: traceId,
        metadata: {
          latency: parseLatency,
          isStructured: !!responseData,
        },
      });
    } catch (error) {
      const errorCategory = categorizeError(error);
      console.warn("AI coach response failed, using fallback:", error);
      
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
      
      // Fallback to rule-based response
      response = generateFallbackCoachResponse(userProfile, currentQuestion);
    }

    // Span 4: Evaluation
    const evalStart = Date.now();
    const evaluation = evaluateCoachResponse(
      response,
      currentQuestion,
      userProfile
    );
    const evalLatency = Date.now() - evalStart;
    
    await logSpan({
      spanName: "evaluation",
      parentTraceId: traceId,
      metadata: {
        latency: evalLatency,
        averageScore: evaluation.average,
        safetyFlags: evaluation.safetyFlags,
      },
    });

    // Log trace to Opik
    const latency = Date.now() - startTime;
    await logTrace({
      traceId,
      experimentName: "coach-chat",
      promptVersion,
      input: {
        userProfile,
        conversationHistory: conversationHistory || [],
        currentQuestion,
        transactions: recentTransactions,
      },
      output: {
        response,
        structuredData: responseData,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        latency,
        usedAI,
        evaluationScore: evaluation.average,
        latencyBreakdown: {
          promptBuild: promptBuildLatency,
          llmCall: llmCallLatency,
          parse: parseLatency,
          evaluation: evalLatency,
        },
        ...(tokenUsage && { tokenUsage }),
      },
    });

    // Log heuristic evaluation to Opik
    await logEvaluation({
      traceId,
      scores: {
        clarity: evaluation.clarity,
        helpfulness: evaluation.helpfulness,
        tone: evaluation.tone,
        financialAlignment: evaluation.financialAlignment,
        safetyFlags: evaluation.safetyFlags,
        average: evaluation.average,
      },
      reasoning: evaluation.reasoning,
      promptVersion,
      evaluator: "heuristic",
    });

    // Optional online LLM-as-judge evaluation (hackathon / demo mode)
    if (process.env.OPIK_LLM_JUDGE_ENABLED === "true") {
      const judge = await runLlmJudgeEvaluation({
        userQuestion: currentQuestion,
        aiResponse: response,
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

    return NextResponse.json({
      response,
      traceId,
      promptVersion,
      evaluation: {
        average: evaluation.average,
        safetyFlags: evaluation.safetyFlags,
      },
    });
  } catch (error) {
    console.error("Error in /api/ai/coach:", error);
    return NextResponse.json(
      { error: "Failed to get coach response" },
      { status: 500 }
    );
  }
}
