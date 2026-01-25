"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { InsightCard } from "@/components/insights/InsightCard";
import { InsightsSkeleton } from "@/components/insights/InsightsSkeleton";
import { generateInsight } from "@/lib/api/insights";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getInsights, saveInsight, hasRecentInsights } from "@/lib/supabase/insights";
import { getTransactions } from "@/lib/supabase/transactions";
import { getUserProfile } from "@/lib/supabase/user";
import { showError } from "@/lib/utils";
import type { DailyInsight, Transaction, UserProfile } from "@/types";

export default function InsightsPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [dailyInsights, setDailyInsights] = React.useState<DailyInsight[]>([]);
  const [weeklyInsights, setWeeklyInsights] = React.useState<DailyInsight[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generatingDaily, setGeneratingDaily] = React.useState(false);
  const [generatingWeekly, setGeneratingWeekly] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        // Check if user is authenticated
        const user = await getCurrentUser();
        if (!user) {
          router.push("/signin?redirect=/insights");
          return;
        }

        // Get user profile from Supabase
        const profile = await getUserProfile();
        if (!profile || !profile.onboardingComplete) {
          router.push("/onboarding");
          return;
        }

        setUserProfile(profile);

        // Load existing insights
        const [daily, weekly] = await Promise.all([
          getInsights("daily", 2),
          getInsights("weekly", 2),
        ]);

        setDailyInsights(daily);
        setWeeklyInsights(weekly);

        // Get transactions for generating new insights if needed
        const transactions = await getTransactions();

        // Generate daily insights if none exist
        if (daily.length === 0 && transactions.length > 0) {
          setGeneratingDaily(true);
          try {
            const response = await generateInsight(profile, transactions, "daily");
            const saved = await saveInsight(
              "daily",
              response.insight.title,
              response.insight.content,
              response.insight.suggestedAction
            );
            setDailyInsights([saved]);
          } catch (error) {
            console.error("Failed to generate daily insight:", error);
            showError(error, "general");
          } finally {
            setGeneratingDaily(false);
          }
        }

        // Generate weekly insights if none exist
        if (weekly.length === 0 && transactions.length > 0) {
          setGeneratingWeekly(true);
          try {
            const response = await generateInsight(profile, transactions, "weekly");
            const saved = await saveInsight(
              "weekly",
              response.insight.title,
              response.insight.content,
              response.insight.suggestedAction
            );
            setWeeklyInsights([saved]);
          } catch (error) {
            console.error("Failed to generate weekly insight:", error);
            showError(error, "general");
          } finally {
            setGeneratingWeekly(false);
          }
        }

        // Generate additional insights if we have fewer than 2
        if (daily.length < 2 && transactions.length > 0 && !generatingDaily) {
          setGeneratingDaily(true);
          try {
            const response = await generateInsight(profile, transactions, "daily");
            const saved = await saveInsight(
              "daily",
              response.insight.title,
              response.insight.content,
              response.insight.suggestedAction
            );
            setDailyInsights((prev) => [...prev, saved].slice(0, 2));
          } catch (error) {
            console.error("Failed to generate additional daily insight:", error);
          } finally {
            setGeneratingDaily(false);
          }
        }

        if (weekly.length < 2 && transactions.length > 0 && !generatingWeekly) {
          setGeneratingWeekly(true);
          try {
            const response = await generateInsight(profile, transactions, "weekly");
            const saved = await saveInsight(
              "weekly",
              response.insight.title,
              response.insight.content,
              response.insight.suggestedAction
            );
            setWeeklyInsights((prev) => [...prev, saved].slice(0, 2));
          } catch (error) {
            console.error("Failed to generate additional weekly insight:", error);
          } finally {
            setGeneratingWeekly(false);
          }
        }
      } catch (error) {
        console.error("Failed to load insights:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return <InsightsSkeleton />;
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Daily & Weekly Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Calm, actionable guidance based on your recent activity.
        </p>
      </div>

      <div className="space-y-10">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Today</h2>
              <p className="text-sm text-muted-foreground">
                Bite-sized insights to keep you focused.
              </p>
            </div>
          </div>
          {generatingDaily && dailyInsights.length === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="border border-border bg-card rounded-lg p-6">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse mb-4" />
                  <div className="space-y-2 mb-4">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : dailyInsights.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {dailyInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  title={insight.title}
                  content={insight.content}
                  suggestedAction={insight.suggestedAction}
                  highlight="Today"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No insights yet. Add some transactions to get personalized insights.</p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">This Week</h2>
            <p className="text-sm text-muted-foreground">
              Patterns and guidance based on your weekly trend.
            </p>
          </div>
          {generatingWeekly && weeklyInsights.length === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="border border-border bg-card rounded-lg p-6">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse mb-4" />
                  <div className="space-y-2 mb-4">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : weeklyInsights.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {weeklyInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  title={insight.title}
                  content={insight.content}
                  suggestedAction={insight.suggestedAction}
                  highlight="This week"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No insights yet. Add some transactions to get personalized insights.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
