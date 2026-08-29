import { MapMarker5 } from "@tailgrids/icons";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolProfileProps {
  data: SchoolIntelligenceData;
}

export default function SchoolProfile({ data }: SchoolProfileProps) {
  const { school, grade12Students } = data;
  const items = [
    { label: "Tỉnh/Thành", value: school.province },
    { label: "Quận/Huyện", value: school.district },
    { label: "Khu vực tuyển sinh", value: school.area },
    { label: "Quy mô lớp 12", value: `${grade12Students.toLocaleString("vi-VN")} học sinh` },
    { label: "Loại hình", value: school.isBoardingSchool ? "Trường DTNT" : "THPT" },
    { label: "Mã trường", value: school.schoolCode },
  ];

  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-5"><div><CardTitle>Hồ sơ trường</CardTitle><p className="mt-1 text-xs leading-5 text-text-tertiary">Thông tin directory được đồng bộ từ danh sách THPT 2025.</p></div></CardHeader>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <div key={item.label}><p className="text-xs text-text-tertiary">{item.label}</p><p className="mt-1 text-sm font-medium text-text-primary">{item.value}</p></div>)}
      </div>
      {school.address && <p className="mt-5 flex items-start gap-2 border-t border-card-border pt-4 text-sm leading-5 text-text-secondary"><MapMarker5 size={16} className="mt-0.5 shrink-0 text-icon-tertiary" />{school.address}</p>}
    </Card>
  );
}
