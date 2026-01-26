import { NextRequest, NextResponse } from "next/server";
import { compareExperiments, type ExperimentRun } from "@/lib/opik/experiments";

/**
 * POST /api/opik/experiments/compare
 * 
 * Compare two experiment runs
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

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error: any) {
    console.error("Error comparing experiments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compare experiments" },
      { status: 500 }
    );
  }
}
