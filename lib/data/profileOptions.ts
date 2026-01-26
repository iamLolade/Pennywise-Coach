import type { SelectOption } from "@/components/ui/select";

const baseIncomeValues = [
  "under-30k",
  "30k-50k",
  "50k-75k",
  "75k-100k",
  "100k-150k",
  "over-150k",
  "prefer-not-to-say",
] as const;

type IncomeRangeValue = (typeof baseIncomeValues)[number];

const preferNotToSay: SelectOption = {
  value: "prefer-not-to-say",
  label: "Prefer not to say",
};

export const incomeRangesByCurrency: Record<string, SelectOption[]> = {
  USD: [
    { value: "under-30k", label: "Under $30,000" },
    { value: "30k-50k", label: "$30,000 - $50,000" },
    { value: "50k-75k", label: "$50,000 - $75,000" },
    { value: "75k-100k", label: "$75,000 - $100,000" },
    { value: "100k-150k", label: "$100,000 - $150,000" },
    { value: "over-150k", label: "Over $150,000" },
    preferNotToSay,
  ],
  EUR: [
    { value: "under-30k", label: "Under €30,000" },
    { value: "30k-50k", label: "€30,000 - €50,000" },
    { value: "50k-75k", label: "€50,000 - €75,000" },
    { value: "75k-100k", label: "€75,000 - €100,000" },
    { value: "100k-150k", label: "€100,000 - €150,000" },
    { value: "over-150k", label: "Over €150,000" },
    preferNotToSay,
  ],
  GBP: [
    { value: "under-30k", label: "Under £30,000" },
    { value: "30k-50k", label: "£30,000 - £50,000" },
    { value: "50k-75k", label: "£50,000 - £75,000" },
    { value: "75k-100k", label: "£75,000 - £100,000" },
    { value: "100k-150k", label: "£100,000 - £150,000" },
    { value: "over-150k", label: "Over £150,000" },
    preferNotToSay,
  ],
  CAD: [
    { value: "under-30k", label: "Under C$30,000" },
    { value: "30k-50k", label: "C$30,000 - C$50,000" },
    { value: "50k-75k", label: "C$50,000 - C$75,000" },
    { value: "75k-100k", label: "C$75,000 - C$100,000" },
    { value: "100k-150k", label: "C$100,000 - C$150,000" },
    { value: "over-150k", label: "Over C$150,000" },
    preferNotToSay,
  ],
  AUD: [
    { value: "under-30k", label: "Under A$35,000" },
    { value: "30k-50k", label: "A$35,000 - A$60,000" },
    { value: "50k-75k", label: "A$60,000 - A$90,000" },
    { value: "75k-100k", label: "A$90,000 - A$120,000" },
    { value: "100k-150k", label: "A$120,000 - A$170,000" },
    { value: "over-150k", label: "Over A$170,000" },
    preferNotToSay,
  ],
  JPY: [
    { value: "under-30k", label: "Under ¥3,000,000" },
    { value: "30k-50k", label: "¥3,000,000 - ¥5,000,000" },
    { value: "50k-75k", label: "¥5,000,000 - ¥7,500,000" },
    { value: "75k-100k", label: "¥7,500,000 - ¥10,000,000" },
    { value: "100k-150k", label: "¥10,000,000 - ¥15,000,000" },
    { value: "over-150k", label: "Over ¥15,000,000" },
    preferNotToSay,
  ],
  CHF: [
    { value: "under-30k", label: "Under CHF 40,000" },
    { value: "30k-50k", label: "CHF 40,000 - CHF 70,000" },
    { value: "50k-75k", label: "CHF 70,000 - CHF 95,000" },
    { value: "75k-100k", label: "CHF 95,000 - CHF 120,000" },
    { value: "100k-150k", label: "CHF 120,000 - CHF 160,000" },
    { value: "over-150k", label: "Over CHF 160,000" },
    preferNotToSay,
  ],
  CNY: [
    { value: "under-30k", label: "Under ¥80,000" },
    { value: "30k-50k", label: "¥80,000 - ¥140,000" },
    { value: "50k-75k", label: "¥140,000 - ¥220,000" },
    { value: "75k-100k", label: "¥220,000 - ¥300,000" },
    { value: "100k-150k", label: "¥300,000 - ¥450,000" },
    { value: "over-150k", label: "Over ¥450,000" },
    preferNotToSay,
  ],
  INR: [
    { value: "under-30k", label: "Under ₹5,00,000" },
    { value: "30k-50k", label: "₹5,00,000 - ₹10,00,000" },
    { value: "50k-75k", label: "₹10,00,000 - ₹18,00,000" },
    { value: "75k-100k", label: "₹18,00,000 - ₹25,00,000" },
    { value: "100k-150k", label: "₹25,00,000 - ₹40,00,000" },
    { value: "over-150k", label: "Over ₹40,00,000" },
    preferNotToSay,
  ],
  BRL: [
    { value: "under-30k", label: "Under R$60.000" },
    { value: "30k-50k", label: "R$60.000 - R$120.000" },
    { value: "50k-75k", label: "R$120.000 - R$180.000" },
    { value: "75k-100k", label: "R$180.000 - R$240.000" },
    { value: "100k-150k", label: "R$240.000 - R$350.000" },
    { value: "over-150k", label: "Over R$350.000" },
    preferNotToSay,
  ],
  MXN: [
    { value: "under-30k", label: "Under Mex$250,000" },
    { value: "30k-50k", label: "Mex$250,000 - Mex$450,000" },
    { value: "50k-75k", label: "Mex$450,000 - Mex$650,000" },
    { value: "75k-100k", label: "Mex$650,000 - Mex$850,000" },
    { value: "100k-150k", label: "Mex$850,000 - Mex$1,200,000" },
    { value: "over-150k", label: "Over Mex$1,200,000" },
    preferNotToSay,
  ],
  ZAR: [
    { value: "under-30k", label: "Under R250,000" },
    { value: "30k-50k", label: "R250,000 - R450,000" },
    { value: "50k-75k", label: "R450,000 - R650,000" },
    { value: "75k-100k", label: "R650,000 - R850,000" },
    { value: "100k-150k", label: "R850,000 - R1,200,000" },
    { value: "over-150k", label: "Over R1,200,000" },
    preferNotToSay,
  ],
  NGN: [
    { value: "under-30k", label: "Under ₦1,200,000" },
    { value: "30k-50k", label: "₦1,200,000 - ₦2,500,000" },
    { value: "50k-75k", label: "₦2,500,000 - ₦4,500,000" },
    { value: "75k-100k", label: "₦4,500,000 - ₦7,000,000" },
    { value: "100k-150k", label: "₦7,000,000 - ₦10,000,000" },
    { value: "over-150k", label: "Over ₦10,000,000" },
    preferNotToSay,
  ],
  SEK: [
    { value: "under-30k", label: "Under kr 250,000" },
    { value: "30k-50k", label: "kr 250,000 - kr 400,000" },
    { value: "50k-75k", label: "kr 400,000 - kr 600,000" },
    { value: "75k-100k", label: "kr 600,000 - kr 800,000" },
    { value: "100k-150k", label: "kr 800,000 - kr 1,100,000" },
    { value: "over-150k", label: "Over kr 1,100,000" },
    preferNotToSay,
  ],
};

export const incomeRanges = incomeRangesByCurrency.USD;

export function getIncomeRanges(currency: string): SelectOption[] {
  return incomeRangesByCurrency[currency] || incomeRangesByCurrency.USD;
}

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
  { value: "SEK", label: "Swedish Krona (kr)" },
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
