import { FileText, Target3, User2, UserMultiple4 } from "@tailgrids/icons";

import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolKpiStripProps {
  data: SchoolIntelligenceData;
}

const items = [
  { key: "potential", label: "Tiềm năng trường", icon: Target3, tone: "text-primary-500", surface: "bg-badge-primary-background" },
  { key: "available", label: "Học sinh khả dụng", icon: UserMultiple4, tone: "text-success-500", surface: "bg-badge-success-background" },
  { key: "relationship", label: "Quan hệ hiện tại", icon: User2, tone: "text-badge-cyan-text", surface: "bg-badge-cyan-background" },
  { key: "enrollment", label: "Nhập học kỳ gần nhất", icon: FileText, tone: "text-warning-500", surface: "bg-badge-warning-background" },
] as const;

export default function SchoolKpiStrip({ data }: SchoolKpiStripProps) {
  const values: Record<(typeof items)[number]["key"], { value: string; note: string }> = {
    potential: {
      value: data.potentialScore + "/100",
      note: data.classification.label,
    },
    available: {
      value: data.availableStudents.toLocaleString("vi-VN"),
      note: Math.round((data.availableStudents / data.grade12Students) * 100) + "% trên " + data.grade12Students.toLocaleString("vi-VN") + " học sinh lớp 12",
    },
    relationship: {
      value: data.relationship.level,
      note: data.relationship.score + "/100 · " + data.geography.cluster,
    },
    enrollment: {
      value: data.enrollment.toLocaleString("vi-VN"),
      note: ((data.enrollment / data.availableStudents) * 100).toFixed(1) + "% trên học sinh khả dụng",
    },
  };

  return (
    <section aria-label="Tóm tắt trường" className="grid min-w-0 overflow-hidden rounded-2xl border border-card-border bg-card-background sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        const current = values[item.key];

        return (
          <div key={item.key} className={"flex min-w-0 items-start gap-3 p-4 lg:p-5 " + (index > 0 ? "border-t border-card-border sm:border-t-0 sm:border-l" : "")}>
            <span className={"flex size-10 shrink-0 items-center justify-center rounded-xl " + item.surface + " " + item.tone} aria-hidden="true"><Icon size={19} /></span>
            <div className="min-w-0">
              <p className="text-xs text-text-tertiary">{item.label}</p>
              <p className="mt-1 truncate text-xl font-semibold text-text-primary">{current.value}</p>
              <p className="mt-1 truncate text-xs text-text-secondary" title={current.note}>{current.note}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
