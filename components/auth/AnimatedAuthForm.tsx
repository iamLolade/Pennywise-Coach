"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/PasswordInput";

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

interface AuthFormProps {
  type: "signin" | "signup";
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  fullName?: string;
  setFullName?: (value: string) => void;
  companyName?: string;
  setCompanyName?: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  error?: string;
  secondaryText: string;
  secondaryLinkText: string;
  secondaryHref: string;
  showTrustIndicators?: boolean;
}

export function AnimatedAuthForm({
  type,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  companyName,
  setCompanyName,
  onSubmit,
  loading = false,
  error,
  secondaryText,
  secondaryLinkText,
  secondaryHref,
  showTrustIndicators = false,
}: AuthFormProps) {
  const isSignup = type === "signup";
  const submitLabel = isSignup ? "Create Account" : "Sign In";
  const loadingLabel = isSignup ? "Creating account..." : "Signing in...";
  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One number", met: /\d/.test(password) },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
  ];
  const showPasswordChecks = isSignup && password.length > 0;

  return (
    <motion.form
      variants={itemVariants}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {isSignup && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-muted-foreground"
            >
              Full name
            </label>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Input
                id="fullName"
                value={fullName || ""}
                onChange={(event) => setFullName?.(event.target.value)}
                placeholder="Alex Rivera"
                required={isSignup}
                className="h-12 md:h-11"
              />
            </motion.div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="companyName"
              className="text-sm font-medium text-muted-foreground"
            >
              Company
            </label>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Input
                id="companyName"
                value={companyName || ""}
                onChange={(event) => setCompanyName?.(event.target.value)}
                placeholder="Studio Co"
                required={isSignup}
                className="h-12 md:h-11"
              />
            </motion.div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-muted-foreground"
        >
          Email
        </label>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            required
            className="h-12 md:h-11"
          />
        </motion.div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-muted-foreground"
        >
          Password
        </label>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <PasswordInput
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            required
          />
        </motion.div>
        {showPasswordChecks && (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              Characters:{" "}
              <span className="font-medium text-foreground">{password.length}</span>
            </p>
            <ul className="space-y-1">
              {passwordRequirements.map((requirement) => (
                <li key={requirement.label} className="flex items-center gap-2">
                  {requirement.met ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      requirement.met ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {requirement.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </motion.div>
      ) : null}

      <Button
        type="submit"
        disabled={loading}
        className="group relative w-full overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2 transition-transform group-hover:-translate-x-1">
          {loading ? (
            <>
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/60 border-t-transparent" />
              {loadingLabel}
            </>
          ) : (
            <>
              {submitLabel}
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </span>
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        {secondaryText}{" "}
        <a
          href={secondaryHref}
          className="font-medium text-primary transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        >
          {secondaryLinkText}
        </a>
      </div>

      {showTrustIndicators ? (
        <div className="space-y-3 border-t border-border/60 pt-4 text-sm text-muted-foreground">
          {["Free to start", "No credit card", "Cancel anytime"].map(
            (item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-2"
              >
                <svg
                  className="h-5 w-5 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{item}</span>
              </motion.div>
            )
          )}
        </div>
      ) : null}
    </motion.form>
  );
}
