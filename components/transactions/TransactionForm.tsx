"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import type { Transaction } from "@/types";

// All available transaction categories
const transactionCategories: SelectOption[] = [
  // Income categories
  { value: "Salary", label: "Salary" },
  { value: "Freelance", label: "Freelance" },
  { value: "Investment", label: "Investment" },
  { value: "Bonus", label: "Bonus" },
  // Expense categories
  { value: "Dining", label: "Dining" },
  { value: "Groceries", label: "Groceries" },
  { value: "Transportation", label: "Transportation" },
  { value: "Housing", label: "Housing" },
  { value: "Utilities", label: "Utilities" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Shopping", label: "Shopping" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Education", label: "Education" },
  { value: "Subscriptions", label: "Subscriptions" },
  { value: "Travel", label: "Travel" },
  { value: "Personal Care", label: "Personal Care" },
];

// Income categories (for determining transaction type)
const incomeCategories = ["Salary", "Freelance", "Investment", "Bonus"];

interface TransactionFormProps {
  transaction?: Transaction; // If provided, form is in edit mode
  onSubmit: (data: Omit<Transaction, "id">) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
  isLoading = false,
}: TransactionFormProps) {
  const isEditMode = !!transaction;

  // Determine initial transaction type based on category or amount
  const getInitialType = (): "income" | "expense" => {
    if (transaction) {
      if (transaction.amount > 0) return "income";
      if (incomeCategories.includes(transaction.category)) return "income";
      return "expense";
    }
    return "expense"; // Default to expense
  };

  const [transactionType, setTransactionType] = React.useState<"income" | "expense">(
    getInitialType()
  );
  const [amount, setAmount] = React.useState(
    transaction ? Math.abs(transaction.amount).toString() : ""
  );
  const [category, setCategory] = React.useState(transaction?.category || "");
  const [date, setDate] = React.useState(
    transaction?.date || new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = React.useState(transaction?.description || "");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Update transaction type when category changes
  React.useEffect(() => {
    if (category && incomeCategories.includes(category)) {
      setTransactionType("income");
    } else if (category && !incomeCategories.includes(category)) {
      setTransactionType("expense");
    }
  }, [category]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }

    if (!category) {
      newErrors.category = "Please select a category";
    }

    if (!date) {
      newErrors.date = "Please select a date";
    }

    if (!description.trim()) {
      newErrors.description = "Please enter a description";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const amountValue = parseFloat(amount);
    const finalAmount = transactionType === "income" ? amountValue : -amountValue;

    onSubmit({
      amount: finalAmount,
      category,
      date,
      description: description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Type Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Transaction Type
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setTransactionType("income");
              // Auto-select income category if expense category is selected
              if (category && !incomeCategories.includes(category)) {
                setCategory("");
              }
            }}
            className={`
              flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200
              ${
                transactionType === "income"
                  ? "bg-success text-success-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            `}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => {
              setTransactionType("expense");
              // Auto-select expense category if income category is selected
              if (category && incomeCategories.includes(category)) {
                setCategory("");
              }
            }}
            className={`
              flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200
              ${
                transactionType === "expense"
                  ? "bg-destructive text-destructive-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            `}
          >
            Expense
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium text-foreground">
          Amount
        </label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) {
                setErrors((prev) => ({ ...prev, amount: "" }));
              }
            }}
            placeholder="0.00"
            className={errors.amount ? "border-destructive focus-visible:ring-destructive" : ""}
            required
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium text-foreground">
          Category
        </label>
        <Select
          id="category"
          options={
            transactionType === "income"
              ? transactionCategories.filter((cat) =>
                  incomeCategories.includes(cat.value)
                )
              : transactionCategories.filter(
                  (cat) => !incomeCategories.includes(cat.value)
                )
          }
          value={category}
          onChange={(value) => {
            setCategory(value);
            if (errors.category) {
              setErrors((prev) => ({ ...prev, category: "" }));
            }
          }}
          placeholder="Select a category"
          required
        />
        {errors.category && (
          <p className="text-xs text-destructive">{errors.category}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label htmlFor="date" className="text-sm font-medium text-foreground">
          Date
        </label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (errors.date) {
              setErrors((prev) => ({ ...prev, date: "" }));
            }
          }}
          max={new Date().toISOString().split("T")[0]} // Can't select future dates
          className={errors.date ? "border-destructive focus-visible:ring-destructive" : ""}
          required
        />
        {errors.date && (
          <p className="text-xs text-destructive">{errors.date}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Description
        </label>
        <Input
          id="description"
          type="text"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) {
              setErrors((prev) => ({ ...prev, description: "" }));
            }
          }}
          placeholder="e.g., Grocery shopping, Salary payment"
          className={errors.description ? "border-destructive focus-visible:ring-destructive" : ""}
          required
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading
            ? isEditMode
              ? "Updating..."
              : "Adding..."
            : isEditMode
              ? "Update Transaction"
              : "Add Transaction"}
        </Button>
      </div>
    </form>
  );
}
