/**
 * Opik client utilities for logging traces and experiments
 * 
 * This module provides a simple interface for integrating Opik observability.
 * In production, this would connect to the Opik API/SDK.
 * 
 * For the hackathon, we'll structure the code to be Opik-ready and include
 * placeholder logging that can be easily replaced with actual Opik SDK calls.
 */

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

/**
 * Log a trace to Opik
 * 
 * In production, this would use the Opik SDK:
 * import { opik } from '@opik/sdk';
 * opik.trace({ ... })
 */
export async function logTrace(trace: OpikTrace): Promise<void> {
  // TODO: Replace with actual Opik SDK call
  // For now, we'll log to console and could store in a local file/database
  
  console.log("[Opik Trace]", {
    traceId: trace.traceId,
    experimentName: trace.experimentName,
    promptVersion: trace.promptVersion,
    timestamp: trace.metadata.timestamp,
  });

  // In a real implementation:
  // await opik.trace({
  //   name: trace.experimentName,
  //   metadata: {
  //     promptVersion: trace.promptVersion,
  //     modelVersion: trace.modelVersion,
  //   },
  //   input: trace.input,
  //   output: trace.output,
  //   metrics: {
  //     latency: trace.metadata.latency,
  //     tokenUsage: trace.metadata.tokenUsage,
  //   },
  // });
}

/**
 * Log an evaluation result to Opik
 */
export async function logEvaluation(evaluation: OpikEvaluation): Promise<void> {
  // TODO: Replace with actual Opik SDK call
  
  console.log("[Opik Evaluation]", {
    traceId: evaluation.traceId,
    averageScore: evaluation.scores.average,
    safetyFlags: evaluation.scores.safetyFlags,
  });

  // In a real implementation:
  // await opik.logEvaluation({
  //   traceId: evaluation.traceId,
  //   scores: evaluation.scores,
  //   reasoning: evaluation.reasoning,
  // });
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
  
  console.log("[Opik Experiment]", {
    experimentId,
    experimentName,
    promptVersion,
    modelVersion,
  });

  // In a real implementation:
  // const experiment = await opik.createExperiment({
  //   name: experimentName,
  //   metadata: { promptVersion, modelVersion },
  // });
  // return experiment.id;

  return experimentId;
}

/**
 * Generate a unique trace ID
 */
export function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
