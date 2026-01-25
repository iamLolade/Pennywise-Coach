"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { AnimatedAuthForm } from "@/components/auth/AnimatedAuthForm";
import { Card } from "@/components/ui/card";
import { signIn, signUp } from "@/lib/supabase/auth";

type AuthMode = "signin" | "signup";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const features = [
  "AI-powered, plain-language insights",
  "Ready in under five minutes",
  "Professional, mobile-friendly guidance",
];

const socialProof = {
  rating: "4.9/5 rating",
  quote: "This made budgeting feel human and calm.",
  attribution: "Alex Rivera, Product Designer",
};

export function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const subcopy = isSignup
    ? "Get a supportive AI coach that explains spending in plain language and helps you take the next step without overwhelm."
    : "Pick up right where you left off and continue building better financial habits.";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setToastMessage(null);
    setLoading(true);

    try {
      if (isSignup) {
        // Sign up new user
        const { user } = await signUp(email, password);
        
        if (user) {
          setToastMessage("Account created successfully! Redirecting...");
          // Redirect to onboarding for new users
          setTimeout(() => {
            router.push("/onboarding");
          }, 1000);
        }
      } else {
        // Sign in existing user
        const { user } = await signIn(email, password);
        
        if (user) {
          setToastMessage("Welcome back! Redirecting...");
          // Redirect to dashboard (or onboarding if no profile)
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {toastMessage ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed right-4 top-4 z-50 w-[320px] rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-lg"
        >
          {toastMessage}
        </motion.div>
      ) : null}

      <header className="relative z-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
          <Link href="/" className="text-lg font-semibold">
            Pennywise Coach
          </Link>
          <div className="flex items-center gap-3">
            {isSignup ? (
              <Link
                href="/signin"
                className="hidden h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:border-primary/40 sm:inline-flex"
              >
                Sign in
              </Link>
            ) : (
              <Link
                href="/signup"
                className="hidden h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
              >
                Create account
              </Link>
            )}
          </div>
        </div>
      </header>

      <motion.main
        className="mx-auto w-full max-w-6xl px-4 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.section className="space-y-5" variants={itemVariants}>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                {isSignup ? "Create calm financial clarity with " : "Welcome back to "}
                <span className="text-primary">Pennywise</span>
              </h1>
            </div>
            <p className="text-lg text-muted-foreground md:text-xl">
              {subcopy}
            </p>
            {isSignup && (
              <div className="grid gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Why choose us?
                </h2>
                <div className="space-y-3">
                  {features.map((feature) => (
                    <motion.div
                      key={feature}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, x: 6 }}
                      className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-muted-foreground shadow-sm"
                    >
                      {feature}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {!isSignup && (
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-border/60 bg-card/70 p-4 text-sm text-muted-foreground"
              >
                Keep your momentum with weekly check-ins and gentle reminders.
              </motion.div>
            )}
          </motion.section>

          <motion.section className="flex justify-center" variants={itemVariants}>
            <Card className="w-full max-w-md border border-border bg-card p-6 shadow-lg">
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="space-y-2 text-center"
              >
                <h2 className="text-2xl font-semibold">
                  {isSignup ? "Get started free" : "Welcome back"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isSignup
                    ? "Create your first financial insight today."
                    : "Sign in to continue your plan."}
                </p>
              </motion.div>
              <div className="mt-6">
                <AnimatedAuthForm
                  type={isSignup ? "signup" : "signin"}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  fullName={fullName}
                  setFullName={setFullName}
                  companyName={companyName}
                  setCompanyName={setCompanyName}
                  onSubmit={handleSubmit}
                  loading={loading}
                  error={error}
                  secondaryText={
                    isSignup
                      ? "Already have an account?"
                      : "Don't have an account?"
                  }
                  secondaryLinkText={isSignup ? "Sign in here" : "Create one"}
                  secondaryHref={isSignup ? "/signin" : "/signup"}
                  showTrustIndicators={isSignup}
                />
              </div>
            </Card>
          </motion.section>
        </div>

        {isSignup && (
          <motion.section
            variants={itemVariants}
            className="mt-10 rounded-2xl border border-border/60 bg-card/70 p-6 text-sm text-muted-foreground"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, index) => (
                  <span
                    key={`avatar-${index}`}
                    className="h-8 w-8 rounded-full border border-border bg-primary/10"
                  />
                ))}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {socialProof.rating}
                </p>
                <p>
                  "{socialProof.quote}" - {socialProof.attribution}
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </motion.main>
    </div>
  );
}
