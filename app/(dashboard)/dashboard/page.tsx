"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeSpending } from "@/lib/api/analyze";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getUserProfile } from "@/lib/supabase/user";
import { getTransactions } from "@/lib/supabase/transactions";
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
    async function loadData() {
      try {
        // Check if user is authenticated
        const user = await getCurrentUser();
        if (!user) {
          router.push("/signin?redirect=/dashboard");
          return;
        }

        // Get user profile from Supabase
        const userProfile = await getUserProfile();
        if (!userProfile || !userProfile.onboardingComplete) {
          router.push("/onboarding");
          return;
        }

        // Get transactions from Supabase
        const userTransactions = await getTransactions();

        setTransactions(userTransactions);

        if (userTransactions.length > 0) {
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
        } else {
          setAnalysis(null);
          setAnalysisLoading(false);
          setAnalysisError(null);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const hasTransactions = transactions.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Overview of your financial activity and insights
          </p>
        </div>

        <div className="space-y-6 lg:space-y-8">
          <SummaryCards transactions={transactions} />

          {!hasTransactions ? (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Get started with your financial journey
                </CardTitle>
                <CardDescription>
                  Add your first transaction to unlock personalized insights and coaching.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Once you start tracking your spending, you'll see detailed breakdowns,
                  spending patterns, and tailored suggestions to help you reach your
                  financial goals.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <AnalysisPanel
                analysis={analysis}
                isLoading={analysisLoading}
                error={analysisError}
                traceId={traceId}
                promptVersion={promptVersion}
              />
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
                <CategoryBreakdown transactions={transactions} />
                <TransactionList transactions={transactions} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
