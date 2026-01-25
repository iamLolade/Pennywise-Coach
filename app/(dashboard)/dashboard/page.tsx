"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { analyzeSpending } from "@/lib/api/analyze";
import { getMockTransactions } from "@/lib/data/mockData";
import type { SpendingAnalysis, Transaction, UserProfile } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [analysis, setAnalysis] = React.useState<SpendingAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = React.useState(false);
  const [analysisError, setAnalysisError] = React.useState<string | null>(null);
  const [traceId, setTraceId] = React.useState<string | null>(null);
  const [promptVersion, setPromptVersion] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Get user profile from localStorage
    const storedProfile = localStorage.getItem("userProfile");
    if (!storedProfile) {
      // Redirect to onboarding if no profile
      router.push("/onboarding");
      return;
    }

    try {
      const userProfile: UserProfile = JSON.parse(storedProfile);
      if (!userProfile.onboardingComplete) {
        router.push("/onboarding");
        return;
      }

      // Get transactions
      const userTransactions = getMockTransactions(userProfile);
      setTransactions(userTransactions);

      // Trigger AI analysis
      setAnalysisLoading(true);
      setAnalysisError(null);
      analyzeSpending(userProfile, userTransactions)
        .then((response) => {
          setAnalysis(response.analysis);
          setTraceId(response.traceId);
          setPromptVersion(response.promptVersion);
        })
        .catch((error: Error) => {
          console.error("Failed to analyze spending:", error);
          setAnalysisError("We couldn't generate insights yet. Try again soon.");
        })
        .finally(() => {
          setAnalysisLoading(false);
        });
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        Dashboard
      </h1>
      <div className="grid gap-6">
        <SummaryCards transactions={transactions} />
        <AnalysisPanel
          analysis={analysis}
          isLoading={analysisLoading}
          error={analysisError}
          traceId={traceId}
          promptVersion={promptVersion}
        />
        <div className="grid gap-6 md:grid-cols-2">
          <CategoryBreakdown transactions={transactions} />
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
