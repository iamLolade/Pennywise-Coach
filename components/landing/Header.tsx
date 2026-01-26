"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { SmoothScrollLink } from "@/components/ui/smooth-scroll-link";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background">
      <Container className="flex items-center justify-between py-4">
        <SmoothScrollLink
          href="#hero"
          className="flex items-center gap-3 text-lg font-semibold text-foreground transition hover:opacity-80"
          onClick={handleCloseMenu}
        >
          <div className="relative h-12 w-12 flex-shrink-0">
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
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {navItems.map((item) => (
            <SmoothScrollLink
              key={item.href}
              href={item.href}
              className="px-4 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            >
              {item.label}
            </SmoothScrollLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/signin">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get started</Button>
            </Link>
          </div>
          <button
            type="button"
            onClick={handleToggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background p-2 text-foreground transition hover:bg-muted md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle navigation</span>
          </button>
        </div>
      </Container>
      {isMenuOpen && (
        <motion.div
          id="mobile-nav"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="border-t border-border bg-background md:hidden"
        >
          <Container className="flex flex-col gap-3 py-4">
            <nav className="flex flex-col gap-2 text-sm">
              {navItems.map((item) => (
                <SmoothScrollLink
                  key={item.href}
                  href={item.href}
                  onClick={handleCloseMenu}
                  className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                >
                  {item.label}
                </SmoothScrollLink>
              ))}
            </nav>
            <div className="flex flex-col gap-2">
              <Link href="/signin" onClick={handleCloseMenu}>
                <Button variant="ghost" className="w-full justify-center">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup" onClick={handleCloseMenu}>
                <Button className="w-full justify-center">Get started</Button>
              </Link>
            </div>
          </Container>
        </motion.div>
      )}
    </header>
  );
}
