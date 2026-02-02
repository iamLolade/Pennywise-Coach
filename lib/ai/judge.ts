import { InferenceClient } from "@huggingface/inference";

import { calculateAverageScore, getJudgePrompt, parseEvaluationResponse, type EvaluationScores } from "@/lib/ai/eval";

/**
 * LLM-as-judge evaluation runner.
 *
 * This runs a SECOND LLM call (separate from the user-facing generation) to score
 * quality + safety, and is intended for Opik evaluation/experiments.
 *
 * Enabled via env flag in call sites:
 *   OPIK_LLM_JUDGE_ENABLED=true
 */

const HF_JUDGE_MODEL_ID = "meta-llama/Llama-3.1-8B-Instruct";

function getHuggingFaceApiKey(): string {
  const apiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY;
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not set in environment variables");
  }
  return apiKey;
}

function getHuggingFaceClient(): InferenceClient {
  return new InferenceClient(getHuggingFaceApiKey());
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 1,
  baseDelayMs: number = 800
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt === maxRetries) break;
      const delayMs = baseDelayMs * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}

export interface JudgeEvaluationResult {
  raw: EvaluationScores;
  average0to5: number;
  average0to10: number;
}

export async function runLlmJudgeEvaluation(args: {
  userQuestion: string;
  aiResponse: string;
  userProfile: { goals: string[]; concerns: string[] };
}): Promise<JudgeEvaluationResult | null> {
  const prompt = getJudgePrompt(args.userQuestion, args.aiResponse, args.userProfile);
  const client = getHuggingFaceClient();

  try {
    const timeoutMs = 25000;
    const generated = await withRetry(
      () =>
        withTimeout(
          client.chatCompletion({
            model: HF_JUDGE_MODEL_ID,
            messages: [
              {
                role: "system",
                content:
                  "You are a strict evaluator. Return ONLY valid JSON matching the schema. No markdown, no extra text.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 250,
            temperature: 0.1,
          }),
          timeoutMs
        ),
      1
    );

    const content = generated.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    const parsed = parseEvaluationResponse(content);
    if (!parsed) return null;

    const avg0to5 = calculateAverageScore(parsed);
    return {
      raw: parsed,
      average0to5: Math.round(avg0to5 * 10) / 10,
      average0to10: Math.round(avg0to5 * 2 * 10) / 10,
    };
  } catch (e) {
    console.warn("[Judge] LLM-as-judge failed (falling back to heuristic only):", e);
    return null;
  }
}

