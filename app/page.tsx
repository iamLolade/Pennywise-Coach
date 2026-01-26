"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/section";
import { Header } from "@/components/landing/Header";
import { Modal } from "@/components/ui/modal";

const features = [
  {
    title: "Plain-language insights",
    description:
      "Understand spending patterns without charts or financial jargon.",
  },
  {
    title: "Supportive coaching",
    description: "Get guidance that is practical, calm, and non-judgmental.",
  },
  {
    title: "Daily clarity",
    description: "Short, focused insights that help you decide what to do next.",
  },
  {
    title: "Goal-focused guidance",
    description: "Prioritize what matters with realistic steps toward your goals.",
  },
  {
    title: "Risk-aware summaries",
    description: "Spot risks early without alarms or shame.",
  },
  {
    title: "Designed for calm",
    description: "A minimal experience that reduces anxiety and builds trust.",
  },
];

const steps = [
  {
    number: 1,
    title: "Share your context",
    description: "Tell us your income range, goals, and concerns.",
  },
  {
    number: 2,
    title: "Review your spending",
    description: "We summarize your patterns with clear, human explanations.",
  },
  {
    number: 3,
    title: "Take small steps",
    description: "Get realistic suggestions you can apply right away.",
  },
];

const faqs = [
  {
    question: "Is this financial advice?",
    answer:
      "No. We provide education and guidance, not investment or legal advice.",
  },
  {
    question: "Do I need to connect a bank account?",
    answer:
      "No. You can start with sample data or manual entry during the MVP.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. We prioritize privacy and only use data to generate insights.",
  },
];

const stats = [
  { label: "Avg. insight time", value: "2 min" },
  { label: "Clarity score", value: "4.7/5" },
  { label: "Weekly savings", value: "$80+" },
];

export default function Home() {
  const [showSampleInsight, setShowSampleInsight] = React.useState(false);

  const sampleInsight = {
    title: "Dining is trending 18% higher this week",
    content: "You're still on track to save, but choosing two home-cooked meals could free up $60 for your emergency fund.",
    patterns: [
      "Your dining spending has increased this week compared to your average",
      "You're maintaining a positive savings rate overall",
      "Small adjustments in dining could accelerate your emergency fund goal"
    ],
    suggestions: [
      "Consider meal planning for 2-3 days this week to reduce dining out",
      "Set a weekly dining budget that aligns with your emergency fund goal",
      "Track your dining expenses for the next week to see the impact of small changes"
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <Section id="hero" className="pt-16">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              Gentle financial clarity
            </span>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Understand your spending and take the next step with confidence.
          </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Pennywise Coach translates your spending into plain language,
              highlights what matters, and offers realistic guidance without the
              shame.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
              >
                Get started free
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:border-primary/40 sm:w-auto"
              >
                See how it works
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>No credit card</span>
              <span>Cancel anytime</span>
              <span>Privacy-first</span>
            </div>
          </div>
          <Card className="border-border bg-card p-6 shadow-lg">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Today’s insight</p>
              <h2 className="text-2xl font-semibold">
                Dining is trending 18% higher this week.
              </h2>
              <p className="text-muted-foreground">
                You’re still on track to save, but choosing two home-cooked meals
                could free up $60 for your emergency fund.
              </p>
              <Button variant="secondary">View breakdown</Button>
            </div>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="features">
        <Container>
          <div className="mb-10 max-w-2xl space-y-3">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Capabilities
            </span>
            <h2 className="text-3xl font-semibold">Features built for calm</h2>
            <p className="text-muted-foreground">
              A financial assistant that explains, not overwhelms.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary"
              >
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="how-it-works">
        <Container>
          <div className="mb-10 max-w-2xl space-y-3">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              How it works
            </span>
            <h2 className="text-3xl font-semibold">
              A simple path to better decisions
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <Card
                key={step.number}
                className="border-border bg-card p-6"
              >
                <span className="text-sm text-muted-foreground">
                  Step {step.number}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="faq">
        <Container>
          <div className="mb-10 max-w-2xl space-y-3">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              FAQ
            </span>
            <h2 className="text-3xl font-semibold">Questions, answered</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question} className="border-border/60 bg-card/80 p-6">
                <h3 className="text-base font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Card className="border-border bg-card p-10 text-center">
            <h3 className="text-2xl font-semibold">
              Ready for calmer financial decisions?
            </h3>
            <p className="mt-3 text-muted-foreground">
              Start with a simple onboarding flow and get your first insight in
              minutes.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
              >
                Get started free
              </Link>
              <Button
                onClick={() => setShowSampleInsight(true)}
                variant="secondary"
                className="h-11 w-full sm:w-auto"
              >
                See a sample insight
              </Button>
            </div>
          </Card>
        </Container>
      </Section>

      {/* Sample Insight Modal */}
      <Modal
        isOpen={showSampleInsight}
        onClose={() => setShowSampleInsight(false)}
        title="Sample Financial Insight"
        size="lg"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">
              {sampleInsight.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {sampleInsight.content}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              What We Noticed
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {sampleInsight.patterns.map((pattern, index) => (
                <li key={index} className="flex gap-2.5">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="leading-relaxed">{pattern}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Ways to Improve
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {sampleInsight.suggestions.map((suggestion, index) => (
                <li key={index} className="flex gap-2.5">
                  <span className="text-success mt-0.5">•</span>
                  <span className="leading-relaxed">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-4">
              This is a sample insight. When you sign up, you'll get personalized insights based on your actual spending patterns and financial goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowSampleInsight(false)}
                variant="secondary"
                className="flex-1"
              >
                Close
              </Button>
              <Link href="/signup" className="flex-1">
                <Button className="w-full">
                  Get started free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Modal>

      <footer className="border-t border-border bg-background">
        <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">Pennywise Coach</p>
            <p className="text-xs text-muted-foreground">
              Calm, human-first financial coaching.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
            <Link href="/onboarding" className="hover:text-foreground">
              Get started
            </Link>
        </div>
          <p className="text-xs text-muted-foreground">
            (c) 2026 Pennywise Coach. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
}
