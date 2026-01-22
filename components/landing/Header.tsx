"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { SmoothScrollLink } from "@/components/ui/smooth-scroll-link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background">
      <Container className="flex items-center justify-between py-4">
        <SmoothScrollLink
          href="#hero"
          className="flex items-center gap-2 text-lg font-semibold text-foreground transition hover:opacity-80"
        >
          <div className="relative h-8 w-8 flex-shrink-0">
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
        </SmoothScrollLink>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <SmoothScrollLink
            href="#features"
            className="transition hover:text-foreground"
          >
            Features
          </SmoothScrollLink>
          <SmoothScrollLink
            href="#how-it-works"
            className="transition hover:text-foreground"
          >
            How it works
          </SmoothScrollLink>
          <SmoothScrollLink
            href="#pricing"
            className="transition hover:text-foreground"
          >
            Pricing
          </SmoothScrollLink>
          <SmoothScrollLink
            href="#faq"
            className="transition hover:text-foreground"
          >
            FAQ
          </SmoothScrollLink>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/signin">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="inline-flex">Get started</Button>
          </Link>
        </div>
      </Container>
    </header>
  );
}
