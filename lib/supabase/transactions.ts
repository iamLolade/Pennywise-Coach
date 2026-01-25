/**
 * Transaction operations with Supabase
 */

import { createClientSupabaseClient } from "./auth-client";
import type { Transaction } from "@/types";

/**
 * Get the authenticated user ID from Supabase Auth
 */
async function getUserId(): Promise<string | null> {
  const supabase = createClientSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Get all transactions for the current user
 */
export async function getTransactions(): Promise<Transaction[]> {
  const userId = await getUserId();

  if (!userId) {
    return [];
  }

  const supabase = createClientSupabaseClient();
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
  const userId = await getUserId();

  if (!userId) {
    throw new Error("User must be authenticated to save transactions");
  }

  const supabase = createClientSupabaseClient();
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
  const userId = await getUserId();

  if (!userId) {
    throw new Error("User must be authenticated to save transactions");
  }

  const supabase = createClientSupabaseClient();
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
 * Update a transaction in Supabase
 */
export async function updateTransaction(
  transactionId: string,
  transaction: Omit<Transaction, "id">
): Promise<Transaction> {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("User must be authenticated to update transactions");
  }

  const supabase = createClientSupabaseClient();
  const { data, error } = await supabase
    .from("transactions")
    .update({
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      description: transaction.description,
    })
    .eq("id", transactionId)
    .eq("user_id", userId) // Ensure user owns this transaction
    .select()
    .single();

  if (error) {
    console.error("Error updating transaction:", error);
    throw new Error("Failed to update transaction");
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
 * Delete a transaction from Supabase
 */
export async function deleteTransaction(transactionId: string): Promise<void> {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("User must be authenticated to delete transactions");
  }

  const supabase = createClientSupabaseClient();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId); // Ensure user owns this transaction

  if (error) {
    console.error("Error deleting transaction:", error);
    throw new Error("Failed to delete transaction");
  }
}

/**
 * Delete all transactions for the current user (useful for testing)
 */
export async function clearTransactions(): Promise<void> {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("User must be authenticated to clear transactions");
  }

  const supabase = createClientSupabaseClient();
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error clearing transactions:", error);
    throw new Error("Failed to clear transactions");
  }
}
