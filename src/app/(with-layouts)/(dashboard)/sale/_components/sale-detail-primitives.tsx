import type { ReactNode } from "react";

export interface SaleDetailFact {
  label: string;
  value: ReactNode;
}

export function SaleDetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title}>
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function SaleDetailFacts({ facts }: { facts: SaleDetailFact[] }) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="min-w-0 rounded-xl border border-card-border bg-background-soft-50 px-3.5 py-3"
        >
          <dt className="text-xs text-text-tertiary">{fact.label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-text-primary">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SaleDetailCallout({
  title,
  children,
  tone = "primary",
}: {
  title: string;
  children: ReactNode;
  tone?: "primary" | "warning" | "danger";
}) {
  const toneClass = {
    primary: "border-primary-100 bg-primary-50/60 text-primary-700",
    warning:
      "border-badge-warning-background bg-badge-warning-background/40 text-warning-700",
    danger:
      "border-badge-error-background bg-badge-error-background/40 text-badge-error-text",
  }[tone];

  return (
    <section className={`rounded-xl border p-4 ${toneClass}`}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-1.5 text-sm leading-6">{children}</div>
    </section>
  );
}
