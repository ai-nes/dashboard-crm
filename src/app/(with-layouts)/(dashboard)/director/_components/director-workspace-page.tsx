import { Badge } from "@/components/tailgrids/core/badge";
import { Card } from "@/components/tailgrids/core/card";

import StudentCardEmptyState from "../students/_components/student-card-empty-state";
import type { DirectorWorkspacePageProps } from "./types";
import WorkspaceMetricCard from "./workspace-metric-card";
import WorkspaceSectionCard from "./workspace-section";

export default function DirectorWorkspacePage({
  code,
  title,
  description,
  metrics,
  sections,
  notice,
}: DirectorWorkspacePageProps) {
  return (
    <main className="min-w-0 space-y-5 px-2 py-4 pb-8 lg:px-6">
      <header className="flex flex-col gap-4 rounded-xl border border-card-border bg-card-background p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div>
          <Badge color="primary">{code} · FAIP</Badge>
          <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{description}</p>
        </div>
      </header>

      <section aria-label="Chỉ số tổng quan" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.length > 0 ? (
          metrics.map((metric) => <WorkspaceMetricCard key={metric.label} metric={metric} />)
        ) : (
          <Card className="min-w-0 sm:col-span-2 xl:col-span-4">
            <StudentCardEmptyState message="Chưa có dữ liệu" />
          </Card>
        )}
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-2" aria-label="Phân tích chi tiết">
        {sections.length > 0 ? (
          sections.map((section) => <WorkspaceSectionCard key={section.title} section={section} />)
        ) : (
          <Card className="min-w-0 xl:col-span-2">
            <StudentCardEmptyState message="Chưa có dữ liệu" />
          </Card>
        )}
      </section>

      {notice && (
        <Card className="border-warning-500/30 bg-badge-warning-background">
          <p className="text-sm leading-6 text-badge-warning-text">{notice}</p>
        </Card>
      )}
    </main>
  );
}
