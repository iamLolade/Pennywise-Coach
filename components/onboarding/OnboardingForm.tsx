"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { saveUserProfile } from "@/lib/supabase/user";
import type { UserProfile } from "@/types";

const incomeRanges = [
  { value: "under-30k", label: "Under $30,000" },
  { value: "30k-50k", label: "$30,000 - $50,000" },
  { value: "50k-75k", label: "$50,000 - $75,000" },
  { value: "75k-100k", label: "$75,000 - $100,000" },
  { value: "100k-150k", label: "$100,000 - $150,000" },
  { value: "over-150k", label: "Over $150,000" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const financialGoals = [
  { id: "build-emergency-fund", label: "Build an emergency fund" },
  { id: "pay-off-debt", label: "Pay off debt" },
  { id: "save-for-vacation", label: "Save for a vacation" },
  { id: "save-for-home", label: "Save for a home" },
  { id: "reduce-spending", label: "Reduce unnecessary spending" },
  { id: "invest-for-future", label: "Invest for the future" },
  { id: "improve-credit-score", label: "Improve credit score" },
  { id: "plan-for-retirement", label: "Plan for retirement" },
];

const financialConcerns = [
  { id: "overspending", label: "I overspend without realizing it" },
  { id: "no-budget", label: "I don't have a budget" },
  { id: "debt-worry", label: "I'm worried about my debt" },
  { id: "saving-difficulty", label: "I find it hard to save money" },
  { id: "unexpected-expenses", label: "Unexpected expenses surprise me" },
  { id: "financial-stress", label: "Money causes me stress" },
  { id: "no-plan", label: "I don't have a financial plan" },
  { id: "tracking-difficulty", label: "I struggle to track my spending" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export function OnboardingForm() {
  const router = useRouter();
  const [incomeRange, setIncomeRange] = React.useState("");
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const toggleConcern = (concernId: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concernId)
        ? prev.filter((id) => id !== concernId)
        : [...prev, concernId]
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);

    if (!incomeRange) {
      setError("Please select your income range");
      return;
    }

    if (selectedGoals.length === 0) {
      setError("Please select at least one financial goal");
      return;
    }

    setLoading(true);

    const userProfile: UserProfile = {
      incomeRange,
      goals: selectedGoals,
      concerns: selectedConcerns,
      onboardingComplete: true,
    };

    // Save to Supabase
    saveUserProfile(userProfile)
      .then(() => {
        router.push("/dashboard");
      })
      .catch((err) => {
        console.error("Failed to save user profile:", err);
        setError("Failed to save your information. Please try again.");
        setLoading(false);
      });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-2xl"
    >
      <Card className="border-border bg-card p-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Let's get to know you</CardTitle>
          <CardDescription>
            Help us personalize your financial coaching experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-2">
              <label
                htmlFor="incomeRange"
                className="text-sm font-medium text-foreground"
              >
                What's your annual income range?
              </label>
              <Select
                id="incomeRange"
                value={incomeRange}
                onChange={(e) => setIncomeRange(e.target.value)}
                required
              >
                <option value="">Select an option</option>
                {incomeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </Select>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                What are your financial goals? (Select all that apply)
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {financialGoals.map((goal) => (
                  <motion.label
                    key={goal.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 transition hover:border-primary/40"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGoals.includes(goal.id)}
                      onChange={() => toggleGoal(goal.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                    />
                    <span className="text-sm text-foreground">{goal.label}</span>
                  </motion.label>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                What are your main financial concerns? (Select all that apply)
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {financialConcerns.map((concern) => (
                  <motion.label
                    key={concern.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 transition hover:border-primary/40"
                  >
                    <input
                      type="checkbox"
                      checked={selectedConcerns.includes(concern.id)}
                      onChange={() => toggleConcern(concern.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                    />
                    <span className="text-sm text-foreground">{concern.label}</span>
                  </motion.label>
                ))}
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Setting up your account..." : "Continue to Dashboard"}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
