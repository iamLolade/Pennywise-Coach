import { NextRequest, NextResponse } from "next/server";
import { compareExperiments, type ExperimentRun } from "@/lib/opik/experiments";
import { logTrace, generateTraceId } from "@/lib/opik/client";

/**
 * POST /api/opik/experiments/compare
 * 
 * Compare two experiment runs and log comparison to Opik
 * 
 * Body:
 * {
 *   experiment1: ExperimentRun;
 *   experiment2: ExperimentRun;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { experiment1, experiment2 } = body;

    if (!experiment1 || !experiment2) {
      return NextResponse.json(
        { error: "Both experiment1 and experiment2 are required" },
        { status: 400 }
      );
    }

    const comparison = compareExperiments(experiment1, experiment2);

    // Log comparison to Opik for judge visibility
    const traceId = generateTraceId();
    await logTrace({
      traceId,
      experimentName: "experiment-comparison",
      promptVersion: `${experiment1.promptVersion} vs ${experiment2.promptVersion}`,
      modelVersion: experiment1.modelVersion || experiment2.modelVersion,
      input: {
        experiment1Id: experiment1.experimentId,
        experiment1Name: experiment1.experimentName,
        experiment1PromptVersion: experiment1.promptVersion,
        experiment2Id: experiment2.experimentId,
        experiment2Name: experiment2.experimentName,
        experiment2PromptVersion: experiment2.promptVersion,
      },
      output: {
        improvements: comparison.improvements,
        regressions: comparison.regressions,
        regressionCount: comparison.regressionCount,
        overallImprovement: comparison.overallImprovement,
        safetyImprovement: comparison.safetyImprovement,
        latencyChange: comparison.latencyChange,
        aiUsageChange: comparison.aiUsageChange,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        experiment1Average: experiment1.summary?.averageScores.average || 0,
        experiment2Average: experiment2.summary?.averageScores.average || 0,
        averageImprovement: comparison.improvements.average,
        hasRegressions: comparison.regressionCount > 0,
      },
    });

    return NextResponse.json({
      success: true,
      comparison,
      traceId, // Return traceId so user can find it in Opik
    });
  } catch (error: unknown) {
    console.error("Error comparing experiments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compare experiments" },
      { status: 500 }
    );
  }
}
