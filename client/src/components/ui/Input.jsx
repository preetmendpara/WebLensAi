import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef(function Input({ className, mono, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-md border border-line-strong bg-canvas px-4",
        "text-ink placeholder:text-ink-faint",
        "transition-[border-color,box-shadow] duration-150",
        "hover:border-ink-faint focus:border-accent focus:outline-none",
        mono && "font-mono text-sm",
        className,
      )}
      {...props}
    />
  );
});
