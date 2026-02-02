/**
 * Opik experiment management and execution
 * 
 * Provides utilities to run experiments, track results, and compare versions
 */

import { EVAL_DATASET, type EvalScenario } from "@/lib/data/evalDataset";
import { PROMPT_VERSIONS, type PromptVersion } from "@/lib/ai/prompts";
import { generateTraceId, logTrace, logEvaluation, createExperiment } from "./client";
import { evaluateCoachResponse } from "@/lib/ai/evaluations";
import { runLlmJudgeEvaluation } from "@/lib/ai/judge";
import { getCoachResponse } from "@/lib/ai/huggingface";
import { getCoachPrompt } from "@/lib/ai/prompts";

export interface ExperimentRun {
  experimentId: string;
  experimentName: string;
  promptVersion: PromptVersion;
  modelVersion?: string;
  startTime: string;
  endTime?: string;
  status: "running" | "completed" | "failed";
  results: ExperimentResult[];
  summary?: ExperimentSummary;
}

export interface ExperimentResult {
  scenarioId: string;
  scenarioName: string;
  traceId: string;
  evaluation: {
    clarity: number;
    helpfulness: number;
    tone: number;
    financialAlignment: number;
    safetyFlags: boolean;
    average: number;
    reasoning?: string;
  };
  latency: number;
  usedAI: boolean;
  error?: string;
}

export interface ExperimentSummary {
  totalScenarios: number;
  completedScenarios: number;
  failedScenarios: number;
  averageScores: {
    clarity: number;
    helpfulness: number;
    tone: number;
    financialAlignment: number;
    average: number;
  };
  safetyFlagsCount: number;
  averageLatency: number;
  aiUsageRate: number; // Percentage of scenarios that used AI vs fallback
}

/**
 * Run an experiment on the evaluation dataset
 */
export async function runExperiment(
  experimentName: string,
  promptVersion: PromptVersion,
  modelVersion?: string,
  scenarioIds?: string[] // If provided, only run these scenarios
): Promise<ExperimentRun> {
  const experimentId = await createExperiment(experimentName, promptVersion, modelVersion);
  const startTime = new Date().toISOString();
  
  const scenariosToRun = scenarioIds
    ? EVAL_DATASET.filter((s) => scenarioIds.includes(s.id))
    : EVAL_DATASET;

  const results: ExperimentResult[] = [];
  
  console.log(`[Opik Experiment] Starting experiment ${experimentId}`);
  console.log(`[Opik Experiment] Running ${scenariosToRun.length} scenarios with prompt version ${promptVersion}`);

  for (const scenario of scenariosToRun) {
    try {
      const traceId = generateTraceId();
      const scenarioStartTime = Date.now();

      // Build prompt
      const prompt = getCoachPrompt(
        promptVersion,
        {
          incomeRange: scenario.userProfile.incomeRange,
          goals: scenario.userProfile.goals,
          concerns: scenario.userProfile.concerns,
          currency: "USD", // Default currency
        },
        [], // No conversation history for eval scenarios
        scenario.userQuestion,
        undefined, // No context summary
        scenario.transactions.map((t) => ({
          amount: t.amount,
          category: t.category,
          date: t.date,
          description: t.description,
        }))
      );

      // Get AI response
      let response: string;
      let usedAI = false;
      let error: string | undefined;

      try {
        const aiResponse = await getCoachResponse(prompt);
        usedAI = true;
        
        // Handle structured or plain text response
        if (typeof aiResponse === "object" && "response" in aiResponse) {
          response = aiResponse.response;
        } else {
          response = aiResponse as string;
        }
      } catch (err: any) {
        error = err.message || "AI generation failed";
        // Use a simple fallback for evaluation
        response = `I understand you're asking about ${scenario.userQuestion}. Let me help you with that.`;
      }

      const latency = Date.now() - scenarioStartTime;

      // Evaluate the response
      const evaluation = evaluateCoachResponse(
        response,
        scenario.userQuestion,
        {
          goals: scenario.userProfile.goals,
          concerns: scenario.userProfile.concerns,
        }
      );

      // Log trace
      await logTrace({
        traceId,
        experimentName,
        promptVersion,
        modelVersion,
        input: {
          userProfile: scenario.userProfile,
          transactions: scenario.transactions,
          userQuestion: scenario.userQuestion,
          scenarioId: scenario.id,
          scenarioName: scenario.name,
        },
        output: {
          response,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          latency,
          usedAI,
          evaluationScore: evaluation.average,
          experimentId,
        },
      });

      // Log heuristic evaluation with metadata for regression tracking
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
        experimentId,
        experimentName,
        evaluator: "heuristic",
      });

      // Optional LLM-as-judge evaluation (recommended for hackathon scoring)
      if (process.env.OPIK_LLM_JUDGE_ENABLED === "true") {
        const judge = await runLlmJudgeEvaluation({
          userQuestion: scenario.userQuestion,
          aiResponse: response,
          userProfile: {
            goals: scenario.userProfile.goals,
            concerns: scenario.userProfile.concerns,
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
            experimentId,
            experimentName,
            evaluator: "llm_judge",
          });
        }
      }

      results.push({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        traceId,
        evaluation: {
          clarity: evaluation.clarity,
          helpfulness: evaluation.helpfulness,
          tone: evaluation.tone,
          financialAlignment: evaluation.financialAlignment,
          safetyFlags: evaluation.safetyFlags,
          average: evaluation.average,
          reasoning: evaluation.reasoning,
        },
        latency,
        usedAI,
        error,
      });

      console.log(`[Opik Experiment] Completed scenario ${scenario.id}: avg score ${evaluation.average.toFixed(1)}`);
    } catch (err: any) {
      console.error(`[Opik Experiment] Failed scenario ${scenario.id}:`, err);
      results.push({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        traceId: generateTraceId(),
        evaluation: {
          clarity: 0,
          helpfulness: 0,
          tone: 0,
          financialAlignment: 0,
          safetyFlags: true,
          average: 0,
          reasoning: `Error: ${err.message || "Unknown error"}`,
        },
        latency: 0,
        usedAI: false,
        error: err.message || "Unknown error",
      });
    }
  }

  // Calculate summary
  const summary = calculateExperimentSummary(results);
  const endTime = new Date().toISOString();

  console.log(`[Opik Experiment] Completed experiment ${experimentId}`);
  console.log(`[Opik Experiment] Summary:`, summary);

  return {
    experimentId,
    experimentName,
    promptVersion,
    modelVersion,
    startTime,
    endTime,
    status: "completed",
    results,
    summary,
  };
}

/**
 * Calculate summary statistics for an experiment
 */
function calculateExperimentSummary(results: ExperimentResult[]): ExperimentSummary {
  const completed = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);
  const withAI = results.filter((r) => r.usedAI);

  const totalScores = completed.reduce(
    (acc, r) => ({
      clarity: acc.clarity + r.evaluation.clarity,
      helpfulness: acc.helpfulness + r.evaluation.helpfulness,
      tone: acc.tone + r.evaluation.tone,
      financialAlignment: acc.financialAlignment + r.evaluation.financialAlignment,
      average: acc.average + r.evaluation.average,
    }),
    { clarity: 0, helpfulness: 0, tone: 0, financialAlignment: 0, average: 0 }
  );

  const count = completed.length || 1; // Avoid division by zero

  const totalLatency = completed.reduce((sum, r) => sum + r.latency, 0);

  return {
    totalScenarios: results.length,
    completedScenarios: completed.length,
    failedScenarios: failed.length,
    averageScores: {
      clarity: totalScores.clarity / count,
      helpfulness: totalScores.helpfulness / count,
      tone: totalScores.tone / count,
      financialAlignment: totalScores.financialAlignment / count,
      average: totalScores.average / count,
    },
    safetyFlagsCount: results.filter((r) => r.evaluation.safetyFlags).length,
    averageLatency: totalLatency / count,
    aiUsageRate: (withAI.length / results.length) * 100,
  };
}

/**
 * Compare two experiment runs
 */
export interface ExperimentComparison {
  experiment1: ExperimentRun;
  experiment2: ExperimentRun;
  improvements: {
    clarity: number; // Difference (exp2 - exp1)
    helpfulness: number;
    tone: number;
    financialAlignment: number;
    average: number;
  };
  safetyImprovement: number; // Reduction in safety flags
  latencyChange: number; // Difference in average latency
  aiUsageChange: number; // Difference in AI usage rate
  regressions: {
    // Metrics that got worse (negative improvements)
    clarity: boolean;
    helpfulness: boolean;
    tone: boolean;
    financialAlignment: boolean;
    average: boolean;
    safety: boolean; // true if safety flags increased
  };
  regressionCount: number; // Total number of regressions
  overallImprovement: boolean; // true if average improved and no critical regressions
}

export function compareExperiments(
  experiment1: ExperimentRun,
  experiment2: ExperimentRun
): ExperimentComparison {
  const summary1 = experiment1.summary!;
  const summary2 = experiment2.summary!;

  const improvements = {
    clarity: summary2.averageScores.clarity - summary1.averageScores.clarity,
    helpfulness: summary2.averageScores.helpfulness - summary1.averageScores.helpfulness,
    tone: summary2.averageScores.tone - summary1.averageScores.tone,
    financialAlignment: summary2.averageScores.financialAlignment - summary1.averageScores.financialAlignment,
    average: summary2.averageScores.average - summary1.averageScores.average,
  };

  const safetyImprovement = summary1.safetyFlagsCount - summary2.safetyFlagsCount;

  // Detect regressions (negative improvements or safety flag increases)
  const regressions = {
    clarity: improvements.clarity < -0.5, // Significant regression threshold
    helpfulness: improvements.helpfulness < -0.5,
    tone: improvements.tone < -0.5,
    financialAlignment: improvements.financialAlignment < -0.5,
    average: improvements.average < -0.5,
    safety: safetyImprovement < 0, // Safety flags increased
  };

  const regressionCount = Object.values(regressions).filter(Boolean).length;

  // Overall improvement: average improved AND no critical regressions (safety or average)
  const overallImprovement =
    improvements.average > 0 && !regressions.safety && !regressions.average;

  return {
    experiment1,
    experiment2,
    improvements,
    safetyImprovement,
    latencyChange: summary2.averageLatency - summary1.averageLatency,
    aiUsageChange: summary2.aiUsageRate - summary1.aiUsageRate,
    regressions,
    regressionCount,
    overallImprovement,
  };
}
