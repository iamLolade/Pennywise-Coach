import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container, Section } from "@/components/ui/section";
import { Header } from "@/components/landing/Header";

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

const testimonials = [
  {
    quote: "It feels like a calm coach, not a judgmental app.",
    name: "Jordan Lee",
    role: "Product Manager",
  },
  {
    quote: "I finally understand where my money goes and why.",
    name: "Avery Chen",
    role: "Designer",
  },
  {
    quote: "Clear, practical guidance without the overwhelm.",
    name: "Sam Rivera",
    role: "Freelancer",
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

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    features: ["Weekly insights", "Basic coaching"],
  },
  {
    name: "Growth",
    price: "$12",
    period: "/mo",
    features: ["Daily insights", "Goal tracking", "Priority support"],
    highlight: true,
  },
  {
    name: "Team",
    price: "Custom",
    period: "",
    features: ["Financial coaching for teams", "Custom reporting"],
  },
];

const stats = [
  { label: "Avg. insight time", value: "2 min" },
  { label: "Clarity score", value: "4.7/5" },
  { label: "Weekly savings", value: "$80+" },
];

export default function Home() {
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

      <Section>
        <Container>
          <div className="mb-10 max-w-2xl space-y-3">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Social proof
            </span>
            <h2 className="text-3xl font-semibold">
              Loved by thoughtful spenders
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="border-border bg-card p-6"
              >
                <p className="text-sm text-muted-foreground">
                  “{testimonial.quote}”
                </p>
                <div className="mt-4 text-sm font-medium">
                  {testimonial.name}
                  <span className="block text-xs text-muted-foreground">
                    {testimonial.role}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="pricing">
        <Container>
          <div className="mb-10 max-w-2xl space-y-3">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Pricing
            </span>
            <h2 className="text-3xl font-semibold">Choose your plan</h2>
            <p className="text-muted-foreground">
              Start free and upgrade when you are ready.
          </p>
        </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`border-border p-6 ${
                  plan.highlight
                    ? "border-primary bg-card shadow-lg"
                    : "bg-card"
                }`}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-2 text-3xl font-semibold">
                  {plan.price}
                  <span className="text-base text-muted-foreground">
                    {plan.period}
                  </span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
                <Button className="mt-6 w-full">
                  {plan.name === "Team" ? "Talk to sales" : "Get started"}
                </Button>
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
              <Link
                href="/dashboard"
                className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:border-primary/40 sm:w-auto"
              >
                See a sample insight
              </Link>
            </div>
          </Card>
        </Container>
      </Section>

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
            <a href="#pricing" className="hover:text-foreground">
              Pricing
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
