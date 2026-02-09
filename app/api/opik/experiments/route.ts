import { NextRequest, NextResponse } from "next/server";
import { runExperiment } from "@/lib/opik/experiments";
import { PROMPT_VERSIONS, type PromptVersion } from "@/lib/ai/prompts";

/**
 * POST /api/opik/experiments
 * 
 * Run an Opik experiment on the evaluation dataset
 * 
 * Body:
 * {
 *   experimentName: string;
 *   promptVersion: PromptVersion;
 *   modelVersion?: string;
 *   scenarioIds?: string[]; // Optional: only run specific scenarios
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      experimentName,
      promptVersion = PROMPT_VERSIONS.v3,
      modelVersion,
      scenarioIds,
    } = body;

    if (!experimentName) {
      return NextResponse.json(
        { error: "experimentName is required" },
        { status: 400 }
      );
    }

    if (!Object.values(PROMPT_VERSIONS).includes(promptVersion)) {
      return NextResponse.json(
        { error: `Invalid promptVersion. Must be one of: ${Object.values(PROMPT_VERSIONS).join(", ")}` },
        { status: 400 }
      );
    }

    console.log(`[Opik API] Starting experiment: ${experimentName} with prompt version ${promptVersion}`);

    const experimentRun = await runExperiment(
      experimentName,
      promptVersion as PromptVersion,
      modelVersion,
      scenarioIds
    );

    return NextResponse.json({
      success: true,
      experiment: experimentRun,
    });
  } catch (error: unknown) {
    console.error("Error running experiment:", error);
    const message = error instanceof Error ? error.message : "Failed to run experiment";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

