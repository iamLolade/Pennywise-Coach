"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface SmoothScrollLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "onDrag" | "onDragEnd" | "onDragStart"> {
  href: string;
  children: React.ReactNode;
}

export function SmoothScrollLink({
  href,
  children,
  className,
  onClick,
  ...props
}: SmoothScrollLinkProps) {
  const smoothScrollTo = React.useCallback((targetY: number) => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      window.scrollTo(0, targetY);
      return;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 450;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + distance * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) {
      return;
    }
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        // Get the sticky header height
        const header = document.querySelector("header");
        const headerHeight = header ? header.offsetHeight : 80;
        
        // Calculate the target position accounting for header
        const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementTop - headerHeight;

        // Smooth scroll to the calculated position
        smoothScrollTo(Math.max(0, offsetPosition));
      }
    }
  };

  if (href.startsWith("#")) {
    // Only pass safe props to motion.a, excluding event handlers that conflict with Framer Motion
    const safeProps: Record<string, unknown> = {};
    const excludeProps = [
      "onDrag",
      "onDragEnd",
      "onDragStart",
      "onAnimationStart",
      "onAnimationEnd",
      "onAnimationIteration",
      "onClick",
    ];
    
    Object.keys(props).forEach((key) => {
      if (!excludeProps.includes(key)) {
        safeProps[key] = (props as Record<string, unknown>)[key];
      }
    });
    
    return (
      <motion.a
        href={href}
        onClick={handleClick}
        className={className}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...safeProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
