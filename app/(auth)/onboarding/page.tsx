import Link from "next/link";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Container } from "@/components/ui/section";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <Container className="flex items-center justify-between py-4">
          <Link href="/" className="text-lg font-semibold text-primary">
            Pennywise Coach
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
