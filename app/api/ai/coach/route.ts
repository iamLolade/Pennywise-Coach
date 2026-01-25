import { NextRequest, NextResponse } from "next/server";

import {
  getCoachResponse,
  generateFallbackCoachResponse,
} from "@/lib/ai/huggingface";
import { getCoachPrompt, PROMPT_VERSIONS } from "@/lib/ai/prompts";
import { generateTraceId, logTrace } from "@/lib/opik/client";
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
      promptVersion = PROMPT_VERSIONS.v2,
    } = body;

    // Validate input
    if (!userProfile || !currentQuestion) {
      return NextResponse.json(
        { error: "Missing required fields: userProfile, currentQuestion" },
        { status: 400 }
      );
    }

    // Build prompt
    const prompt = getCoachPrompt(
      promptVersion,
      userProfile,
      conversationHistory || [],
      currentQuestion,
      contextSummary || undefined
    );

    // Try AI response first, fallback to rule-based if it fails
    let response: string;
    let usedAI = false;

    try {
      response = await getCoachResponse(prompt);
      usedAI = true;
    } catch (error) {
      console.warn("AI coach response failed, using fallback:", error);
      // Fallback to rule-based response
      response = generateFallbackCoachResponse(userProfile, currentQuestion);
    }

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
      },
      output: {
        response,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        latency,
        usedAI,
      },
    });

    return NextResponse.json({
      response,
      traceId,
      promptVersion,
    });
  } catch (error) {
    console.error("Error in /api/ai/coach:", error);
    return NextResponse.json(
      { error: "Failed to get coach response" },
      { status: 500 }
    );
  }
}
