import { cn } from "@/lib/cn";

/** Grouping only, never decoration (§8). Hairline border, no shadow. */
export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn("rounded-lg border border-line bg-canvas", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn("border-b border-line px-5 py-4", className)}>{children}</div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
