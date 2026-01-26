import { NextRequest, NextResponse } from "next/server";

import {
  getCoachResponse,
  generateFallbackCoachResponse,
  type CoachResponseData,
} from "@/lib/ai/huggingface";
import { getCoachPrompt, PROMPT_VERSIONS } from "@/lib/ai/prompts";
import { evaluateCoachResponse } from "@/lib/ai/evaluations";
import { generateTraceId, logTrace, logEvaluation } from "@/lib/opik/client";
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

    // Build prompt with improved structure
    const prompt = getCoachPrompt(
      promptVersion,
      userProfile,
      conversationHistory || [],
      currentQuestion,
      contextSummary || undefined,
      recentTransactions
    );

    // Try AI response first, fallback to rule-based if it fails
    let response: string;
    let responseData: CoachResponseData | null = null;
    let usedAI = false;

    try {
      const aiResponse = await getCoachResponse(prompt);
      usedAI = true;

      // Handle structured response
      if (typeof aiResponse === "object" && "response" in aiResponse) {
        responseData = aiResponse;
        response = aiResponse.response;
      } else {
        // Plain text response
        response = typeof aiResponse === "string" ? aiResponse : String(aiResponse);
      }
    } catch (error) {
      console.warn("AI coach response failed, using fallback:", error);
      // Fallback to rule-based response
      response = generateFallbackCoachResponse(userProfile, currentQuestion);
    }

    // Evaluate the response quality
    const evaluation = evaluateCoachResponse(
      response,
      currentQuestion,
      userProfile
    );

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
      },
    });

    // Log evaluation to Opik
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
    });

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
