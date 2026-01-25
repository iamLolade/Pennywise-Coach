"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { signOut } from "@/lib/supabase/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [showSignOutModal, setShowSignOutModal] = React.useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/coach", label: "Coach" },
    { href: "/insights", label: "Insights" },
    { href: "/settings", label: "Settings" },
  ];

  const isActive = (href: string) => pathname === href;

  const handleSignOutClick = () => {
    setShowSignOutModal(true);
  };

  const handleSignOutConfirm = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
      setShowSignOutModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 text-xl font-semibold text-primary transition hover:opacity-80"
            >
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image
                  src="/mascot.png"
                  alt="Pennywise Coach Mascot"
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-bold tracking-tight">
                Pennywise Coach
              </span>
            </Link>
            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                      ${
                        active
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }
                    `}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
              <div className="mx-2 h-6 w-px bg-border" />
              <button
                onClick={handleSignOutClick}
                disabled={isSigningOut}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all duration-200 disabled:opacity-50"
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>

      <ConfirmationModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOutConfirm}
        title="Sign out"
        description="Are you sure you want to sign out? You'll need to sign in again to access your dashboard."
        confirmText="Sign out"
        cancelText="Cancel"
        confirmVariant="primary"
        isLoading={isSigningOut}
      />
    </div>
  );
}
