import { FileText, User2, UserMultiple1, UserMultiple4 } from "@tailgrids/icons";

import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolKpiStripProps {
  data: SchoolIntelligenceData;
}

const iconClassName = "flex size-10 shrink-0 items-center justify-center rounded-xl bg-badge-primary-background text-badge-primary-text";

export default function SchoolKpiStrip({ data }: SchoolKpiStripProps) {
  const items = [
    { label: "Học sinh lớp 12", value: data.grade12Students, change: null, icon: <UserMultiple4 size={20} /> },
    { label: "Prospects", value: data.prospects, change: data.changes.prospects, icon: <User2 size={20} /> },
    { label: "Applications", value: data.applications, change: data.changes.applications, icon: <FileText size={20} /> },
    { label: "Enrollment", value: data.enrollment, change: data.changes.enrollment, icon: <UserMultiple1 size={20} /> },
  ];

  return (
    <section aria-label="Chỉ số tuyển sinh" className="grid grid-cols-1 divide-y divide-card-border overflow-hidden rounded-xl border border-card-border bg-card-background sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 p-4">
          <span className={iconClassName} aria-hidden="true">{item.icon}</span>
          <div className="min-w-0">
            <p className="text-xs text-text-tertiary">{item.label}</p>
            <p className="mt-0.5 text-xl font-semibold text-text-primary">{item.value.toLocaleString("vi-VN")}</p>
            {item.change !== null && (
              <p className={`mt-0.5 text-xs font-medium ${item.change >= 0 ? "text-success-500" : "text-error-500"}`}>
                {item.change >= 0 ? "+" : ""}{item.change}% so với kỳ trước
              </p>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
