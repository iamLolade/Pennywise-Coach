"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Container } from "@/components/ui/section";
import { getCurrentUser } from "@/lib/supabase/auth";

export default function OnboardingPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push("/signin?redirect=/onboarding");
        }
      } catch (error) {
        router.push("/signin?redirect=/onboarding");
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <Container className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold transition hover:opacity-80">
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
        </Container>
      </header>
      <main className="py-12">
        <Container>
          <OnboardingForm />
        </Container>
      </main>
    </div>
  );
}
