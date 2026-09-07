import { Layers2, User2, UserMultiple1, UserMultiple4 } from "@tailgrids/icons";
import type { ReactNode } from "react";
import { Card } from "@/components/tailgrids/core/card";

const variants = {
  teams: {
    icon: UserMultiple4,
    tone: "bg-badge-primary-background text-badge-primary-text",
  },
  groups: {
    icon: Layers2,
    tone: "bg-badge-sky-background text-badge-sky-text",
  },
  members: {
    icon: UserMultiple1,
    tone: "bg-badge-primary-background text-badge-primary-text",
  },
  sale: {
    icon: User2,
    tone: "bg-badge-success-background text-badge-success-text",
  },
  collaborators: {
    icon: UserMultiple4,
    tone: "bg-badge-sky-background text-badge-sky-text",
  },
  lead: {
    icon: User2,
    tone: "bg-badge-success-background text-badge-success-text",
  },
} as const;

interface OverviewFactProps {
  label: string;
  value?: number;
  kind?: keyof typeof variants;
  children?: ReactNode;
}

export default function OverviewFact({
  label,
  value,
  kind = "members",
  children,
}: OverviewFactProps) {
  const { icon: Icon, tone } = variants[kind];
  return (
    <Card className="flex min-w-0 items-center gap-4 rounded-2xl border border-card-border p-5">
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-secondary">{label}</p>
        {children ? (
          <div className="mt-1">{children}</div>
        ) : (
          <p className="mt-0.5 text-2xl font-semibold tabular-nums text-text-primary">
            {value}
          </p>
        )}
      </div>
    </Card>
  );
}
