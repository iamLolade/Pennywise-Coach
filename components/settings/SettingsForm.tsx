"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  currencies,
  financialConcerns,
  financialGoals,
  getIncomeRanges,
} from "@/lib/data/profileOptions";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getUserProfile, saveUserProfile } from "@/lib/supabase/user";
import { showError, showSuccess } from "@/lib/utils";
import type { UserProfile } from "@/types";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export function SettingsForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [incomeRange, setIncomeRange] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = React.useState<string[]>([]);

  const incomeOptions = React.useMemo(() => getIncomeRanges(currency), [currency]);

  React.useEffect(() => {
    async function loadProfile() {
      try {
        // Check authentication first (matches dashboard pattern)
        const user = await getCurrentUser();
        if (!user) {
          router.push("/signin?redirect=/settings");
          return;
        }

        // Then check profile/onboarding
        const profile = await getUserProfile();
        if (!profile || !profile.onboardingComplete) {
          router.push("/onboarding");
          return;
        }

        setIncomeRange(profile.incomeRange || "");
        setCurrency(profile.currency || "USD");
        setSelectedGoals(profile.goals || []);
        setSelectedConcerns(profile.concerns || []);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load profile";
        console.error("Failed to load profile:", errorMessage);
        showError(error, "general");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!incomeRange) {
      showError("Please select your income range");
      return;
    }

    if (selectedGoals.length === 0) {
      showError("Please select at least one financial goal");
      return;
    }

    setSaving(true);

    try {
      const userProfile: UserProfile = {
        incomeRange,
        currency: currency || "USD",
        goals: selectedGoals,
        concerns: selectedConcerns,
        onboardingComplete: true,
      };

      await saveUserProfile(userProfile);
      showSuccess("Your preferences have been updated.");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      console.error("Failed to update profile:", errorMessage);
      showError(error, "general");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-3xl"
    >
      <Card className="border-border bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Profile settings</CardTitle>
          <CardDescription>Update your financial preferences anytime.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium text-foreground">
                Preferred currency
              </label>
              <Select
                id="currency"
                name="currency"
                options={currencies}
                value={currency}
                onChange={(value) => {
                  setCurrency(value);
                  setIncomeRange("");
                }}
                placeholder="Select your currency"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label
                htmlFor="incomeRange"
                className="text-sm font-medium text-foreground"
              >
                Annual income range ({currency})
              </label>
              <Select
                id="incomeRange"
                name="incomeRange"
                options={incomeOptions}
                value={incomeRange}
                onChange={(value) => setIncomeRange(value)}
                placeholder="Select an option"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Financial goals
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
                Financial concerns
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

            <motion.div variants={itemVariants}>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving changes..." : "Save changes"}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
