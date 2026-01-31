"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { PROMPT_VERSIONS, type PromptVersion } from "@/lib/ai/prompts";
import type { ExperimentRun, ExperimentComparison } from "@/lib/opik/experiments";
import { showError, showSuccess } from "@/lib/utils";

const promptVersionOptions = Object.values(PROMPT_VERSIONS).map((v) => ({
  value: v,
  label: v,
}));

export default function ExperimentsPage() {
  const [experimentName, setExperimentName] = React.useState("");
  const [promptVersion, setPromptVersion] = React.useState<PromptVersion>(PROMPT_VERSIONS.v3);
  const [isRunning, setIsRunning] = React.useState(false);
  const [experiments, setExperiments] = React.useState<ExperimentRun[]>([]);
  const [selectedExperiment1, setSelectedExperiment1] = React.useState<string>("");
  const [selectedExperiment2, setSelectedExperiment2] = React.useState<string>("");
  const [comparison, setComparison] = React.useState<ExperimentComparison | null>(null);
  const [isComparing, setIsComparing] = React.useState(false);

  const handleRunExperiment = async () => {
    if (!experimentName.trim()) {
      showError("Please enter an experiment name");
      return;
    }

    setIsRunning(true);
    try {
      const response = await fetch("/api/opik/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experimentName: experimentName.trim(),
          promptVersion,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to run experiment");
      }

      const data = await response.json();
      setExperiments((prev) => [data.experiment, ...prev]);
      setExperimentName("");
      showSuccess(`Experiment "${data.experiment.experimentName}" completed successfully!`);
    } catch (error: any) {
      console.error("Failed to run experiment:", error);
      showError(error, "general");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedExperiment1 || !selectedExperiment2) {
      showError("Please select two experiments to compare");
      return;
    }

    if (selectedExperiment1 === selectedExperiment2) {
      showError("Please select two different experiments");
      return;
    }

    setIsComparing(true);
    try {
      const exp1 = experiments.find((e) => e.experimentId === selectedExperiment1);
      const exp2 = experiments.find((e) => e.experimentId === selectedExperiment2);

      if (!exp1 || !exp2) {
        throw new Error("Selected experiments not found");
      }

      const response = await fetch("/api/opik/experiments/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experiment1: exp1,
          experiment2: exp2,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to compare experiments");
      }

      const data = await response.json();
      setComparison(data.comparison);
      showSuccess("Experiments compared successfully!");
    } catch (error: any) {
      console.error("Failed to compare experiments:", error);
      showError(error, "general");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-2">
            Opik Experiments
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Run and compare AI prompt experiments to track quality improvements
          </p>
        </div>

        <div className="space-y-6 lg:space-y-8">
          {/* Run Experiment Form */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Run New Experiment</CardTitle>
              <CardDescription>
                Test a prompt version against the evaluation dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="experimentName" className="text-sm font-medium text-foreground">
                    Experiment Name
                  </label>
                  <input
                    id="experimentName"
                    type="text"
                    value={experimentName}
                    onChange={(e) => setExperimentName(e.target.value)}
                    placeholder="e.g., v3-structured-json-test-1"
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="promptVersion" className="text-sm font-medium text-foreground">
                    Prompt Version
                  </label>
                  <Select
                    id="promptVersion"
                    options={promptVersionOptions}
                    value={promptVersion}
                    onChange={(value) => setPromptVersion(value as PromptVersion)}
                  />
                </div>
                <Button
                  onClick={handleRunExperiment}
                  disabled={isRunning}
                  className="w-full sm:w-auto"
                >
                  {isRunning ? "Running experiment..." : "Run Experiment"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Compare Experiments */}
          {experiments.length >= 2 && (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Compare Experiments</CardTitle>
                <CardDescription>
                  Compare two experiment runs to see improvements and regressions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Experiment 1 (Baseline)
                      </label>
                      <Select
                        options={experiments.map((e) => ({
                          value: e.experimentId,
                          label: `${e.experimentName} (${e.promptVersion})`,
                        }))}
                        value={selectedExperiment1}
                        onChange={setSelectedExperiment1}
                        placeholder="Select experiment..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Experiment 2 (Improved)
                      </label>
                      <Select
                        options={experiments.map((e) => ({
                          value: e.experimentId,
                          label: `${e.experimentName} (${e.promptVersion})`,
                        }))}
                        value={selectedExperiment2}
                        onChange={setSelectedExperiment2}
                        placeholder="Select experiment..."
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCompare}
                    disabled={isComparing || !selectedExperiment1 || !selectedExperiment2}
                    className="w-full sm:w-auto"
                  >
                    {isComparing ? "Comparing..." : "Compare Experiments"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Results */}
          {comparison && (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Comparison Results</CardTitle>
                <CardDescription>
                  {comparison.overallImprovement ? (
                    <span className="text-success">Overall improvement detected ✓</span>
                  ) : (
                    <span className="text-muted-foreground">
                      {comparison.regressionCount > 0
                        ? `${comparison.regressionCount} regression(s) detected`
                        : "No significant improvement"}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                      Score Improvements
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      {Object.entries(comparison.improvements).map(([key, value]) => {
                        const isRegression = comparison.regressions[key as keyof typeof comparison.regressions];
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-md border ${
                              isRegression
                                ? "border-destructive bg-destructive/10"
                                : value > 0
                                ? "border-success bg-success/10"
                                : "border-border bg-card"
                            }`}
                          >
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              {key}
                            </p>
                            <p
                              className={`text-lg font-semibold ${
                                isRegression
                                  ? "text-destructive"
                                  : value > 0
                                  ? "text-success"
                                  : "text-foreground"
                              }`}
                            >
                              {value > 0 ? "+" : ""}
                              {value.toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-3 rounded-md border border-border bg-card">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Safety Flags
                      </p>
                      <p
                        className={`text-lg font-semibold ${
                          comparison.safetyImprovement > 0
                            ? "text-success"
                            : comparison.safetyImprovement < 0
                            ? "text-destructive"
                            : "text-foreground"
                        }`}
                      >
                        {comparison.safetyImprovement > 0 ? "+" : ""}
                        {comparison.safetyImprovement}
                      </p>
                    </div>
                    <div className="p-3 rounded-md border border-border bg-card">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Latency Change
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {comparison.latencyChange > 0 ? "+" : ""}
                        {comparison.latencyChange.toFixed(0)}ms
                      </p>
                    </div>
                    <div className="p-3 rounded-md border border-border bg-card">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Regressions
                      </p>
                      <p
                        className={`text-lg font-semibold ${
                          comparison.regressionCount > 0 ? "text-destructive" : "text-success"
                        }`}
                      >
                        {comparison.regressionCount}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experiment History */}
          {experiments.length > 0 && (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Experiment History</CardTitle>
                <CardDescription>
                  {experiments.length} experiment(s) run
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {experiments.map((exp) => (
                    <div
                      key={exp.experimentId}
                      className="p-4 rounded-md border border-border bg-card hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-foreground">
                            {exp.experimentName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Prompt: {exp.promptVersion} • Status: {exp.status}
                          </p>
                          {exp.summary && (
                            <div className="mt-3 grid gap-2 sm:grid-cols-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">Avg Score:</span>{" "}
                                <span className="font-semibold text-foreground">
                                  {exp.summary.averageScores.average.toFixed(1)}/10
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Safety Flags:</span>{" "}
                                <span className="font-semibold text-foreground">
                                  {exp.summary.safetyFlagsCount}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Scenarios:</span>{" "}
                                <span className="font-semibold text-foreground">
                                  {exp.summary.completedScenarios}/{exp.summary.totalScenarios}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">AI Usage:</span>{" "}
                                <span className="font-semibold text-foreground">
                                  {exp.summary.aiUsageRate.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
