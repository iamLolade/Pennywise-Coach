"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNet,
  formatCurrency,
} from "@/lib/utils/transactions";
import type { Transaction } from "@/types";

interface SummaryCardsProps {
  transactions: Transaction[];
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);
  const net = calculateNet(transactions);

  const cards = [
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      description: "All income sources",
      color: "text-success",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      description: "All spending",
      color: "text-foreground",
    },
    {
      title: "Net Amount",
      value: formatCurrency(net),
      description: net >= 0 ? "You're saving!" : "You're overspending",
      color: net >= 0 ? "text-success" : "text-destructive",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-semibold ${card.color}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
