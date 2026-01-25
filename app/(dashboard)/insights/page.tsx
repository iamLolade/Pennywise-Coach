"use client";

import { InsightCard } from "@/components/insights/InsightCard";
import type { DailyInsight } from "@/types";

const dailyInsights: DailyInsight[] = [
  {
    id: "daily-1",
    date: "Today",
    title: "Steady progress on essentials",
    content:
      "Your essential spending has been consistent this week, which helps keep your budget predictable.",
    suggestedAction:
      "Keep essentials under the same limit and consider moving any leftover funds to savings.",
  },
  {
    id: "daily-2",
    date: "Today",
    title: "Small wins add up",
    content:
      "You made a few smaller purchases instead of one large one, which can make spending feel more manageable.",
    suggestedAction:
      "Set a soft daily cap for discretionary spending to keep this momentum going.",
  },
];

const weeklyInsights: DailyInsight[] = [
  {
    id: "weekly-1",
    date: "This week",
    title: "Spending rhythm is clear",
    content:
      "Your spending peaks mid-week and tapers on weekends. This pattern can help you plan ahead.",
    suggestedAction:
      "Try preparing mid-week meals or subscriptions to reduce those peak costs.",
  },
  {
    id: "weekly-2",
    date: "This week",
    title: "Savings opportunity detected",
    content:
      "Two categories account for most discretionary spending this week.",
    suggestedAction:
      "Pick one category to trim by 10% and track the impact over the next 7 days.",
  },
];

export default function InsightsPage() {
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
          <div className="grid gap-4 md:grid-cols-2">
            {dailyInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                title={insight.title}
                content={insight.content}
                suggestedAction={insight.suggestedAction}
                highlight={insight.date}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">This Week</h2>
            <p className="text-sm text-muted-foreground">
              Patterns and guidance based on your weekly trend.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {weeklyInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                title={insight.title}
                content={insight.content}
                suggestedAction={insight.suggestedAction}
                highlight={insight.date}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
