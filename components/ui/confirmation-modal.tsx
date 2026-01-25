"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "secondary" | "destructive";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isLoading = false,
}: ConfirmationModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={isLoading}
                  className="min-w-[80px]"
                >
                  {cancelText}
                </Button>
                <Button
                  variant={confirmVariant === "destructive" ? "primary" : confirmVariant}
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`min-w-[80px] ${
                    confirmVariant === "destructive"
                      ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      : ""
                  }`}
                >
                  {isLoading ? "Processing..." : confirmText}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
