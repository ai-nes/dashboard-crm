import type { ReactNode } from "react";

interface StudentActivityGroupProps {
  id: string;
  label: string;
  count: number;
  tone?: "default" | "danger";
  children: ReactNode;
}

export default function StudentActivityGroup({
  id,
  label,
  count,
  tone = "default",
  children,
}: StudentActivityGroupProps) {
  return (
    <section className="space-y-3" aria-labelledby={id}>
      <div className="flex items-center gap-2">
        <h3
          id={id}
          className={
            tone === "danger"
              ? "text-sm font-semibold text-error-500"
              : "text-sm font-semibold text-text-secondary"
          }
        >
          {label}
        </h3>
        <span className="rounded-full bg-background-gray-secondary_alt px-2 py-0.5 text-xs font-medium text-text-tertiary">
          {count}
        </span>
        <span className="h-px flex-1 bg-card-border" aria-hidden="true" />
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
