import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { WorkspaceSection, WorkspaceTone } from "./types";

const TONE_COLORS: Record<WorkspaceTone, string> = {
  primary: "bg-brand-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
};

export default function WorkspaceSectionCard({ section }: { section: WorkspaceSection }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>{section.title}</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">{section.description}</p>
        </div>
      </CardHeader>

      <div className="divide-y divide-card-border">
        {section.items.map((item) => {
          const tone = item.tone ?? "primary";

          return (
            <div key={item.label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${TONE_COLORS[tone]}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-text-tertiary">{item.detail}</p>
              </div>
              {item.value && <span className="shrink-0 text-sm font-semibold text-text-primary">{item.value}</span>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
