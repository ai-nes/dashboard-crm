import type { ReactNode } from "react";
import { Card } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";

interface LeadDetailSectionProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function LeadDetailSection({
  title,
  description,
  icon,
  children,
  className,
}: LeadDetailSectionProps) {
  return (
    <Card className={cn("min-w-0 rounded-2xl p-4 sm:p-5", className)}>
      <section aria-label={title}>
        <header className="mb-6 flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background-gray-secondary text-text-secondary"
          >
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">
              {description}
            </p>
          </div>
        </header>
        {children}
      </section>
    </Card>
  );
}
