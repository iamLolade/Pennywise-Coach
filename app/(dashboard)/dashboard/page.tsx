"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { getMockTransactions } from "@/lib/data/mockData";
import type { Transaction, UserProfile } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);

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
        <AnalysisPanel />
        <div className="grid gap-6 md:grid-cols-2">
          <CategoryBreakdown transactions={transactions} />
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
