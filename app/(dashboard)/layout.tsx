"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signOut } from "@/lib/supabase/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-xl font-semibold text-primary transition hover:opacity-80"
            >
              Pennywise Coach
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Dashboard
              </Link>
              <Link
                href="/coach"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Coach
              </Link>
              <Link
                href="/insights"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Insights
              </Link>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition disabled:opacity-50"
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
