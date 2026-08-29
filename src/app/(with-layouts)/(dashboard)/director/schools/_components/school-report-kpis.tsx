import { Buildings11, MapMarker5, Target3, TrendUp2 } from "@tailgrids/icons";

import type { SchoolReportData } from "@/services/api/schools/types";

interface SchoolReportKpisProps {
  data: SchoolReportData;
}

export default function SchoolReportKpis({ data }: SchoolReportKpisProps) {
  const items = [
    { label: "Trường THPT theo dõi", value: data.totalSchools, note: "Trong directory 2025", icon: <Buildings11 size={19} /> },
    { label: "Tỉnh/Thành có dữ liệu", value: data.totalProvinces, note: "Phủ toàn bộ khu vực", icon: <MapMarker5 size={19} /> },
    { label: "Trường ưu tiên", value: data.prioritySchools, note: "Potential Score từ 88", icon: <Target3 size={19} /> },
    { label: "Potential Score trung bình", value: `${data.averagePotential}/100`, note: "Điểm cơ hội ước tính", icon: <TrendUp2 size={19} /> },
  ];

  return (
    <section aria-label="Tổng quan báo cáo" className="grid grid-cols-1 divide-y divide-card-border overflow-hidden rounded-xl border border-card-border bg-card-background sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
      {items.map((item) => <div key={item.label} className="flex items-center gap-3 p-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-badge-primary-background text-badge-primary-text" aria-hidden="true">{item.icon}</span><div><p className="text-xs text-text-tertiary">{item.label}</p><p className="mt-0.5 text-xl font-semibold text-text-primary">{typeof item.value === "number" ? item.value.toLocaleString("vi-VN") : item.value}</p><p className="mt-0.5 text-xs text-text-secondary">{item.note}</p></div></div>)}
    </section>
  );
}
