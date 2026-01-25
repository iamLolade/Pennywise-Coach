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
  ...props
}: SmoothScrollLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
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
