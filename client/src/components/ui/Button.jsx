import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-accent text-canvas hover:bg-accent-hover active:translate-y-px disabled:bg-ink-faint",
  secondary:
    "bg-canvas text-ink border border-line-strong hover:bg-surface active:translate-y-px",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface",
  danger: "bg-critical text-canvas hover:brightness-95 active:translate-y-px",
};

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

/**
 * Tactile, restrained. Press state is a 1px shift — no glow, no scale
 * bounce (DESIGN_SYSTEM §12). Loading keeps width stable so the button
 * never jumps mid-request.
 */
export const Button = forwardRef(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium",
        "transition-[background-color,color,transform,border-color] duration-150",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
