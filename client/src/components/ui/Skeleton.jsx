import { cn } from "@/lib/cn";

/** Structured loading (§33). Pulse only — nothing shimmers or slides. */
export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-sm bg-sunken", className)} />;
}
