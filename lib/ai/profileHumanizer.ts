import {
  financialConcerns,
  financialGoals,
  getIncomeRanges,
} from "@/lib/data/profileOptions";

export function humanizeIncomeRange(
  incomeRangeValue: string | undefined,
  currency: string
): string {
  if (!incomeRangeValue) return "Not provided";
  const match = getIncomeRanges(currency).find((o) => o.value === incomeRangeValue);
  return match?.label || incomeRangeValue;
}

export function humanizeGoalIds(goalIds: string[] | undefined): string[] {
  if (!goalIds || goalIds.length === 0) return [];
  return goalIds.map((id) => financialGoals.find((g) => g.id === id)?.label || id);
}

export function humanizeConcernIds(concernIds: string[] | undefined): string[] {
  if (!concernIds || concernIds.length === 0) return [];
  return concernIds.map(
    (id) => financialConcerns.find((c) => c.id === id)?.label || id
  );
}

export function humanizeProfileForPrompt(userProfile: {
  incomeRange: string;
  goals: string[];
  concerns: string[];
  currency?: string;
}) {
  const currency = userProfile.currency || "USD";
  return {
    currency,
    incomeRangeLabel: humanizeIncomeRange(userProfile.incomeRange, currency),
    goalsLabels: humanizeGoalIds(userProfile.goals),
    concernsLabels: humanizeConcernIds(userProfile.concerns),
  };
}

