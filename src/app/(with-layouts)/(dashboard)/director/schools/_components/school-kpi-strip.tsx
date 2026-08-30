import { FileText, Target3, User2, UserMultiple4 } from "@tailgrids/icons";

import type { SchoolClassification, SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolKpiStripProps {
  data: SchoolIntelligenceData;
}

const items = [
  { key: "potential", label: "Mức độ ưu tiên", icon: Target3, tone: "text-primary-500", surface: "bg-badge-primary-background" },
  { key: "available", label: "Học sinh có thể tiếp cận", icon: UserMultiple4, tone: "text-success-500", surface: "bg-badge-success-background" },
  { key: "relationship", label: "Mức độ hợp tác", icon: User2, tone: "text-badge-cyan-text", surface: "bg-badge-cyan-background" },
  { key: "enrollment", label: "Kết quả tuyển sinh", icon: FileText, tone: "text-warning-500", surface: "bg-badge-warning-background" },
] as const;

const priorityNotes: Record<SchoolClassification, string> = {
  "Trọng điểm": "Ưu tiên chăm sóc sâu",
  "Mở rộng": "Ưu tiên mở quan hệ",
  "Duy trì": "Giữ nhịp chăm sóc",
  "Sàng lọc": "Theo dõi trước khi đầu tư",
};

export default function SchoolKpiStrip({ data }: SchoolKpiStripProps) {
  const values: Record<(typeof items)[number]["key"], { value: string; note: string }> = {
    potential: {
      value: data.potentialScore + "/100",
      note: priorityNotes[data.classification.group],
    },
    available: {
      value: data.availableStudents.toLocaleString("vi-VN"),
      note: Math.round((data.availableStudents / data.grade12Students) * 100) + "% số học sinh lớp 12",
    },
    relationship: {
      value: data.relationship.level,
      note: "Điểm hợp tác: " + data.relationship.score + "/100",
    },
    enrollment: {
      value: ((data.enrollment / data.availableStudents) * 100).toFixed(1) + "%",
      note: data.enrollment.toLocaleString("vi-VN") + " / " + data.availableStudents.toLocaleString("vi-VN") + " HS có thể tiếp cận",
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
