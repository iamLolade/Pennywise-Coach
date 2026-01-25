"use client";

import * as React from "react";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SpendingAnalysis } from "@/types";

interface AnalysisPanelProps {
  analysis?: SpendingAnalysis | null;
  isLoading?: boolean;
  error?: string | null;
  traceId?: string | null;
  promptVersion?: string | null;
}

export function AnalysisPanel({
  analysis,
  isLoading = false,
  error = null,
  traceId = null,
  promptVersion = null,
}: AnalysisPanelProps) {
  if (isLoading) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your Financial Insights</CardTitle>
          <CardDescription>
            Taking a thoughtful look at your spending patterns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              We're reviewing your transactions to understand your habits and find opportunities to help you reach your goals.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-75" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-150" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your Financial Insights</CardTitle>
          <CardDescription>
            We're having trouble generating insights right now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't worry—this happens sometimes. Your data is safe, and we'll try again shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              In the meantime, you can still review your transactions and categories below.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your Financial Insights</CardTitle>
          <CardDescription>
            Personalized insights to help you understand your spending.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Once we've analyzed your transactions, you'll see a clear summary of your spending patterns, helpful suggestions, and gentle guidance tailored to your goals.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Your Financial Insights</CardTitle>
        <CardDescription>
          A clear, supportive overview of your spending patterns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Overview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">What We Noticed</h3>
            {analysis.patterns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                As you continue tracking your spending, we'll start to notice helpful patterns that can guide your decisions.
              </p>
            ) : (
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {analysis.patterns.map((pattern) => (
                  <li key={pattern} className="flex gap-2.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="leading-relaxed">{pattern}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Ways to Improve</h3>
            {analysis.suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keep tracking your spending—we'll provide personalized suggestions as we learn more about your habits.
              </p>
            ) : (
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {analysis.suggestions.map((suggestion) => (
                  <li key={suggestion} className="flex gap-2.5">
                    <span className="text-success mt-0.5">•</span>
                    <span className="leading-relaxed">{suggestion}</span>
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
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Things That Stand Out</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {analysis.anomalies.map((anomaly) => (
                  <li key={anomaly} className="flex gap-2.5">
                    <span className="text-accent mt-0.5">•</span>
                    <span className="leading-relaxed">{anomaly}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </CardContent>
      {(traceId || promptVersion) && (
        <CardFooter className="pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {traceId && (
              <span>
                Trace: <code className="text-xs font-mono">{traceId.slice(0, 8)}...</code>
              </span>
            )}
            {promptVersion && (
              <span>
                Prompt: <code className="text-xs font-mono">{promptVersion}</code>
              </span>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
