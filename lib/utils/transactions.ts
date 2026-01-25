/**
 * Utility functions for transaction calculations and summaries
 */

import type { Transaction } from "@/types";

/**
 * Calculate total income from transactions
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total expenses from transactions
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );
}

/**
 * Calculate net amount (income - expenses)
 */
export function calculateNet(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate spending by category
 */
export function calculateByCategory(
  transactions: Transaction[]
): Record<string, number> {
  const byCategory: Record<string, number> = {};

  transactions
    .filter((t) => t.amount < 0) // Only expenses
    .forEach((t) => {
      const category = t.category;
      const amount = Math.abs(t.amount);
      byCategory[category] = (byCategory[category] || 0) + amount;
    });

  return byCategory;
}

/**
 * Get top spending categories
 */
export function getTopCategories(
  byCategory: Record<string, number>,
  limit: number = 5
): Array<{ category: string; amount: number }> {
  return Object.entries(byCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

/**
 * Format currency amount
 * @param amount - The amount to format
 * @param currency - Currency code (default: USD)
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Get recent transactions (last N days)
 */
export function getRecentTransactions(
  transactions: Transaction[],
  days: number = 30
): Transaction[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate >= cutoffDate;
  });
}
