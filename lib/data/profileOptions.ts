import type { SelectOption } from "@/components/ui/select";

export const incomeRanges: SelectOption[] = [
  { value: "under-30k", label: "Under $30,000" },
  { value: "30k-50k", label: "$30,000 - $50,000" },
  { value: "50k-75k", label: "$50,000 - $75,000" },
  { value: "75k-100k", label: "$75,000 - $100,000" },
  { value: "100k-150k", label: "$100,000 - $150,000" },
  { value: "over-150k", label: "Over $150,000" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export const currencies: SelectOption[] = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "CHF", label: "Swiss Franc (CHF)" },
  { value: "CNY", label: "Chinese Yuan (¥)" },
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "BRL", label: "Brazilian Real (R$)" },
  { value: "MXN", label: "Mexican Peso (Mex$)" },
  { value: "ZAR", label: "South African Rand (R)" },
  { value: "NGN", label: "Nigerian Naira (₦)" },
];

export const financialGoals = [
  { id: "build-emergency-fund", label: "Build an emergency fund" },
  { id: "pay-off-debt", label: "Pay off debt" },
  { id: "save-for-vacation", label: "Save for a vacation" },
  { id: "save-for-home", label: "Save for a home" },
  { id: "reduce-spending", label: "Reduce unnecessary spending" },
  { id: "invest-for-future", label: "Invest for the future" },
  { id: "improve-credit-score", label: "Improve credit score" },
  { id: "plan-for-retirement", label: "Plan for retirement" },
];

export const financialConcerns = [
  { id: "overspending", label: "I overspend without realizing it" },
  { id: "no-budget", label: "I don't have a budget" },
  { id: "debt-worry", label: "I'm worried about my debt" },
  { id: "saving-difficulty", label: "I find it hard to save money" },
  { id: "unexpected-expenses", label: "Unexpected expenses surprise me" },
  { id: "financial-stress", label: "Money causes me stress" },
  { id: "no-plan", label: "I don't have a financial plan" },
  { id: "tracking-difficulty", label: "I struggle to track my spending" },
];
