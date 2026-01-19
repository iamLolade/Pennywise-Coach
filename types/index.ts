/**
 * Shared TypeScript types for the application
 */

export interface UserProfile {
  incomeRange: string;
  goals: string[];
  concerns: string[];
  onboardingComplete: boolean;
}

export interface Transaction {
  id: string;
  amount: number; // Negative for expenses, positive for income
  category: string;
  date: string; // ISO date string
  description: string;
}

export interface SpendingAnalysis {
  totalSpent: number;
  totalIncome: number;
  byCategory: Record<string, number>;
  patterns: string[];
  anomalies: string[];
  summary: string;
  suggestions: string[];
}

export interface CoachMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface DailyInsight {
  id: string;
  date: string;
  title: string;
  content: string;
  suggestedAction?: string;
}
