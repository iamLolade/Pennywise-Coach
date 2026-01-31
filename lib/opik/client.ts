/**
 * Opik client utilities for logging traces and experiments
 * 
 * This module provides a simple interface for integrating Opik observability.
 *
 * We keep a small, stable surface (`logTrace`, `logEvaluation`, `createExperiment`)
 * so the rest of the app doesn't need to know about the Opik SDK details.
 *
 * Opik tracing docs (TypeScript):
 * - https://www.comet.com/docs/opik/quickstart
 * - https://www.comet.com/docs/opik/tracing/log_traces?from=llm
 */

import { Opik } from "opik";

export interface OpikTrace {
  traceId: string;
  experimentName: string;
  promptVersion: string;
  modelVersion?: string;
  input: {
    userProfile: unknown;
    transactions?: unknown;
    userQuestion?: string;
    conversationHistory?: unknown;
    currentQuestion?: string;
    type?: string;
    [key: string]: unknown; // Allow additional input fields
  };
  output: {
    response?: string;
    suggestedActions?: string[];
    insight?: unknown;
    [key: string]: unknown; // Allow additional output fields
  };
  metadata: {
    timestamp: string;
    latency?: number;
    tokenUsage?: {
      input: number;
      output: number;
    };
    usedAI?: boolean;
    type?: string;
    [key: string]: unknown; // Allow additional metadata fields
  };
}

export interface OpikEvaluation {
  traceId: string;
  scores: {
    clarity: number;
    helpfulness: number;
    tone: number;
    financialAlignment: number;
    safetyFlags: boolean;
    average: number;
  };
  reasoning?: string;
}

type OpikClient = InstanceType<typeof Opik>;

let clientSingleton: OpikClient | null = null;

function getOpikClient(): OpikClient | null {
  // If Opik isn't configured, we no-op (keeps local dev / CI smooth).
  if (!process.env.OPIK_API_KEY) return null;

  if (clientSingleton) return clientSingleton;

  // Prefer env vars as documented by Opik.
  // - OPIK_API_KEY (required)
  // - OPIK_WORKSPACE (workspace name)
  // - OPIK_PROJECT_NAME (optional)
  // - OPIK_URL_OVERRIDE (optional; recommended for Opik Cloud)
  const workspaceName = process.env.OPIK_WORKSPACE;
  const projectName = process.env.OPIK_PROJECT_NAME;
  const apiUrl = process.env.OPIK_URL_OVERRIDE;

  // The Opik SDK supports env-based configuration, but we pass through the most
  // important fields explicitly so misconfig is easier to debug.
  clientSingleton = new Opik({
    // These are optional in the SDK if env vars are set; we include them if present.
    ...(workspaceName ? { workspaceName } : {}),
    ...(projectName ? { projectName } : {}),
    ...(apiUrl ? { apiUrl } : {}),
    // Note: apiKey can be inferred from env; we pass it explicitly for clarity.
    apiKey: process.env.OPIK_API_KEY,
  } as any);

  return clientSingleton;
}

async function flushIfHelpful(client: OpikClient): Promise<void> {
  // Opik batches traces in production by default. During local dev / hackathon demos,
  // flushing makes traces show up immediately.
  if (process.env.NODE_ENV === "production") return;
  try {
    await (client as any).flush?.();
  } catch (e) {
    // Don't let observability break the app.
    console.warn("[Opik] flush failed:", e);
  }
}

/**
 * Log a trace to Opik
 * 
 * Uses the Opik TypeScript SDK `client.trace(...)` API.
 */
export async function logTrace(trace: OpikTrace): Promise<void> {
  const client = getOpikClient();
  if (!client) {
    console.log("[Opik Trace - skipped (missing OPIK_API_KEY)]", {
      traceId: trace.traceId,
      experimentName: trace.experimentName,
      promptVersion: trace.promptVersion,
      timestamp: trace.metadata.timestamp,
    });
    return;
  }

  try {
    const opikTrace = (client as any).trace?.({
      name: trace.experimentName,
      input: {
        ...trace.input,
        // Ensure our internal trace id is searchable even if Opik generates its own ids.
        traceId: trace.traceId,
        promptVersion: trace.promptVersion,
        ...(trace.modelVersion ? { modelVersion: trace.modelVersion } : {}),
      },
      output: trace.output,
      metadata: trace.metadata,
      tags: [
        "pennywise-coach",
        trace.experimentName,
        trace.promptVersion,
      ],
    });

    // Opik trace objects support end() per quickstart.
    opikTrace?.end?.();
    await flushIfHelpful(client);
  } catch (e) {
    console.warn("[Opik] logTrace failed:", e);
  }
}

/**
 * Log an evaluation result to Opik
 */
export async function logEvaluation(evaluation: OpikEvaluation): Promise<void> {
  const client = getOpikClient();
  if (!client) {
    console.log("[Opik Evaluation - skipped (missing OPIK_API_KEY)]", {
      traceId: evaluation.traceId,
      averageScore: evaluation.scores.average,
      safetyFlags: evaluation.scores.safetyFlags,
    });
    return;
  }

  // The TS SDK quickstart shows `trace(...)` logging. To keep this integration
  // minimal and non-invasive, we record evaluations as their own Opik trace.
  // We preserve the linkage by including `traceId` in the input/tags.
  try {
    const opikEvalTrace = (client as any).trace?.({
      name: "evaluation",
      input: { traceId: evaluation.traceId },
      output: {
        scores: evaluation.scores,
        reasoning: evaluation.reasoning,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        score: evaluation.scores.average,
        safetyFlags: evaluation.scores.safetyFlags,
      },
      tags: ["pennywise-coach", "evaluation", evaluation.traceId],
    });

    opikEvalTrace?.end?.();
    await flushIfHelpful(client);
  } catch (e) {
    console.warn("[Opik] logEvaluation failed:", e);
  }
}

/**
 * Create a new experiment run
 * 
 * This would typically be called at the start of an evaluation run
 */
export async function createExperiment(
  experimentName: string,
  promptVersion: string,
  modelVersion?: string
): Promise<string> {
  const experimentId = `${experimentName}-${promptVersion}-${Date.now()}`;
  
  // Optional: could be logged to Opik as a trace, but experiment runs are
  // already represented by per-scenario traces in `lib/opik/experiments.ts`.
  console.log("[Opik Experiment]", { experimentId, experimentName, promptVersion, modelVersion });

  return experimentId;
}

/**
 * Generate a unique trace ID
 */
export function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
