"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { analyzeSpending } from "@/lib/api/analyze";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getUserProfile } from "@/lib/supabase/user";
import {
  getTransactions,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/supabase/transactions";
import { showError, showSuccess } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import type { SpendingAnalysis, Transaction, UserProfile } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [analysis, setAnalysis] = React.useState<SpendingAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = React.useState(false);
  const [analysisError, setAnalysisError] = React.useState<string | null>(null);
  const [traceId, setTraceId] = React.useState<string | null>(null);
  const [promptVersion, setPromptVersion] = React.useState<string | null>(null);
  const [showAddTransactionModal, setShowAddTransactionModal] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = React.useState<Transaction | null>(null);
  const [isSavingTransaction, setIsSavingTransaction] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        // Check if user is authenticated
        const user = await getCurrentUser();
        if (!user) {
          router.push("/signin?redirect=/dashboard");
          return;
        }

        // Get user profile from Supabase
        const profile = await getUserProfile();
        if (!profile || !profile.onboardingComplete) {
          router.push("/onboarding");
          return;
        }

        setUserProfile(profile);

        // Get transactions from Supabase
        const userTransactions = await getTransactions();

        setTransactions(userTransactions);

        if (userTransactions.length > 0) {
          // Trigger AI analysis
          setAnalysisLoading(true);
          setAnalysisError(null);
          analyzeSpending(profile, userTransactions)
            .then((response) => {
              setAnalysis(response.analysis);
              setTraceId(response.traceId);
              setPromptVersion(response.promptVersion);
            })
            .catch((error: Error) => {
              console.error("Failed to analyze spending:", error);
              setAnalysisError("We couldn't generate insights yet. Try again soon.");
            })
            .finally(() => {
              setAnalysisLoading(false);
            });
        } else {
          setAnalysis(null);
          setAnalysisLoading(false);
          setAnalysisError(null);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const hasTransactions = transactions.length > 0;

  const handleAddTransaction = async (transactionData: Omit<Transaction, "id">) => {
    setIsSavingTransaction(true);
    try {
      // Save transaction to Supabase
      const savedTransaction = await saveTransaction(transactionData);
      
      // Add to local state
      const updatedTransactions = [savedTransaction, ...transactions];
      setTransactions(updatedTransactions);

      // Close modal
      setShowAddTransactionModal(false);

      // Show success message
      showSuccess("Transaction added successfully!");

      // If we have a user profile, trigger AI analysis
      if (userProfile && updatedTransactions.length > 0) {
        setAnalysisLoading(true);
        setAnalysisError(null);
        
        analyzeSpending(userProfile, updatedTransactions)
          .then((response) => {
            setAnalysis(response.analysis);
            setTraceId(response.traceId);
            setPromptVersion(response.promptVersion);
          })
          .catch((error: Error) => {
            console.error("Failed to analyze spending:", error);
            setAnalysisError("We couldn't generate insights yet. Try again soon.");
          })
          .finally(() => {
            setAnalysisLoading(false);
          });
      }
    } catch (error) {
      console.error("Failed to save transaction:", error);
      showError(error, "general");
    } finally {
      setIsSavingTransaction(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleUpdateTransaction = async (transactionData: Omit<Transaction, "id">) => {
    if (!editingTransaction) return;

    setIsSavingTransaction(true);
    try {
      // Update transaction in Supabase
      const updatedTransaction = await updateTransaction(
        editingTransaction.id,
        transactionData
      );

      // Update local state
      const updatedTransactions = transactions.map((t) =>
        t.id === editingTransaction.id ? updatedTransaction : t
      );
      setTransactions(updatedTransactions);

      // Close modal
      setEditingTransaction(null);

      // Show success message
      showSuccess("Transaction updated successfully!");

      // Refresh AI analysis
      if (userProfile && updatedTransactions.length > 0) {
        setAnalysisLoading(true);
        setAnalysisError(null);

        analyzeSpending(userProfile, updatedTransactions)
          .then((response) => {
            setAnalysis(response.analysis);
            setTraceId(response.traceId);
            setPromptVersion(response.promptVersion);
          })
          .catch((error: Error) => {
            console.error("Failed to analyze spending:", error);
            setAnalysisError("We couldn't generate insights yet. Try again soon.");
          })
          .finally(() => {
            setAnalysisLoading(false);
          });
      }
    } catch (error) {
      console.error("Failed to update transaction:", error);
      showError(error, "general");
    } finally {
      setIsSavingTransaction(false);
    }
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;

    setIsSavingTransaction(true);
    try {
      // Delete transaction from Supabase
      await deleteTransaction(deletingTransaction.id);

      // Update local state
      const updatedTransactions = transactions.filter(
        (t) => t.id !== deletingTransaction.id
      );
      setTransactions(updatedTransactions);

      // Close modal
      setDeletingTransaction(null);

      // Show success message
      showSuccess("Transaction deleted successfully!");

      // Refresh AI analysis
      if (userProfile && updatedTransactions.length > 0) {
        setAnalysisLoading(true);
        setAnalysisError(null);

        analyzeSpending(userProfile, updatedTransactions)
          .then((response) => {
            setAnalysis(response.analysis);
            setTraceId(response.traceId);
            setPromptVersion(response.promptVersion);
          })
          .catch((error: Error) => {
            console.error("Failed to analyze spending:", error);
            setAnalysisError("We couldn't generate insights yet. Try again soon.");
          })
          .finally(() => {
            setAnalysisLoading(false);
          });
      } else {
        // No transactions left, clear analysis
        setAnalysis(null);
        setAnalysisLoading(false);
        setAnalysisError(null);
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      showError(error, "general");
    } finally {
      setIsSavingTransaction(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8 lg:mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Overview of your financial activity and insights
            </p>
          </div>
          <Button
            onClick={() => setShowAddTransactionModal(true)}
            className="hidden sm:inline-flex"
          >
            Add Transaction
          </Button>
        </div>

        <div className="space-y-6 lg:space-y-8">
          <SummaryCards 
            transactions={transactions} 
            currency={userProfile?.currency || "USD"} 
          />

          {!hasTransactions ? (
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Get started with your financial journey
                </CardTitle>
                <CardDescription>
                  Add your first transaction to unlock personalized insights and coaching.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Once you start tracking your spending, you'll see detailed breakdowns,
                  spending patterns, and tailored suggestions to help you reach your
                  financial goals.
                </p>
                <Button
                  onClick={() => setShowAddTransactionModal(true)}
                  className="w-full sm:w-auto"
                >
                  Add Your First Transaction
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
                <CategoryBreakdown 
                  transactions={transactions} 
                  currency={userProfile?.currency || "USD"} 
                />
                <TransactionList 
                  transactions={transactions} 
                  currency={userProfile?.currency || "USD"}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteClick}
                />
              </div>
              <AnalysisPanel
                analysis={analysis}
                isLoading={analysisLoading}
                error={analysisError}
                traceId={traceId}
                promptVersion={promptVersion}
              />
            </>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
        title="Add Transaction"
        size="md"
      >
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setShowAddTransactionModal(false)}
          isLoading={isSavingTransaction}
        />
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Edit Transaction"
        size="md"
      >
        <TransactionForm
          transaction={editingTransaction || undefined}
          onSubmit={handleUpdateTransaction}
          onCancel={() => setEditingTransaction(null)}
          isLoading={isSavingTransaction}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        description={`Are you sure you want to delete "${deletingTransaction?.description}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
        isLoading={isSavingTransaction}
      />
    </div>
  );
}
