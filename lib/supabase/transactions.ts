/**
 * Transaction operations with Supabase
 */

import { supabase } from "./client";
import type { Transaction } from "@/types";

/**
 * Generate a simple user ID for MVP (in production, use Supabase Auth)
 */
function getUserId(): string {
  if (typeof window === "undefined") {
    return "anonymous";
  }
  
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("userId", userId);
  }
  return userId;
}

/**
 * Get all transactions for the current user
 */
export async function getTransactions(): Promise<Transaction[]> {
  const userId = getUserId();

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((t) => ({
    id: t.id,
    amount: Number(t.amount),
    category: t.category,
    date: t.date,
    description: t.description,
  }));
}

/**
 * Save a transaction to Supabase
 */
export async function saveTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction> {
  const userId = getUserId();

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      description: transaction.description,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving transaction:", error);
    throw new Error("Failed to save transaction");
  }

  return {
    id: data.id,
    amount: Number(data.amount),
    category: data.category,
    date: data.date,
    description: data.description,
  };
}

/**
 * Save multiple transactions to Supabase
 */
export async function saveTransactions(transactions: Omit<Transaction, "id">[]): Promise<Transaction[]> {
  const userId = getUserId();

  const { data, error } = await supabase
    .from("transactions")
    .insert(
      transactions.map((t) => ({
        user_id: userId,
        amount: t.amount,
        category: t.category,
        date: t.date,
        description: t.description,
      }))
    )
    .select();

  if (error) {
    console.error("Error saving transactions:", error);
    throw new Error("Failed to save transactions");
  }

  return data.map((t) => ({
    id: t.id,
    amount: Number(t.amount),
    category: t.category,
    date: t.date,
    description: t.description,
  }));
}

/**
 * Delete all transactions for the current user (useful for testing)
 */
export async function clearTransactions(): Promise<void> {
  const userId = getUserId();

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error clearing transactions:", error);
    throw new Error("Failed to clear transactions");
  }
}
