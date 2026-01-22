import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50";
    const sizes = "h-11 px-5";
    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-md",
      secondary:
        "border border-border bg-background text-foreground hover:border-primary/40 hover:text-foreground",
      ghost: "bg-transparent text-foreground hover:bg-muted",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cx(base, sizes, variants[variant], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
