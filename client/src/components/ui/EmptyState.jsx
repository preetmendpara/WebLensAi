import { cn } from "@/lib/cn";

export function EmptyState({ title, description, action, className }) {
  return (
    <div className={cn("border border-dashed border-line rounded-lg px-6 py-16 text-center", className)}>
      <p className="text-title font-medium text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
