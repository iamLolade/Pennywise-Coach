"use client";

import * as React from "react";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SpendingAnalysis } from "@/types";

interface AnalysisPanelProps {
  analysis?: SpendingAnalysis | null;
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  if (!analysis) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">AI Spending Analysis</CardTitle>
          <CardDescription>
            We'll summarize your trends and highlight gentle next steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Analysis will appear here once it's generated.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">AI Spending Analysis</CardTitle>
        <CardDescription>
          A clear, supportive read on your recent activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-semibold text-foreground">Summary</h3>
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-semibold text-foreground">Patterns</h3>
            {analysis.patterns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No notable patterns detected yet.
              </p>
            ) : (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {analysis.patterns.map((pattern) => (
                  <li key={pattern} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{pattern}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-semibold text-foreground">Suggestions</h3>
            {analysis.suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keep tracking for more tailored suggestions.
              </p>
            ) : (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {analysis.suggestions.map((suggestion) => (
                  <li key={suggestion} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {analysis.anomalies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="space-y-2"
            >
              <h3 className="text-sm font-semibold text-foreground">Anomalies</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {analysis.anomalies.map((anomaly) => (
                  <li key={anomaly} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{anomaly}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
