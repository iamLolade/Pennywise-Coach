"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--card)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)",
          padding: "12px 16px",
          maxWidth: "360px",
        },
        success: {
          style: {
            border: "1px solid var(--primary)",
          },
        },
        error: {
          style: {
            border: "1px solid var(--destructive)",
          },
        },
      }}
    />
  );
}
