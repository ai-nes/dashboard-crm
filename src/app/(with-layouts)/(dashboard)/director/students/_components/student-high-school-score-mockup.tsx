"use client";

import { BarChart2 } from "@tailgrids/icons";

import { Card } from "@/components/tailgrids/core/card";

import StudentCardHeader from "./student-card-header";

interface HighSchoolScoreField {
  label: string;
  value?: string;
}

const highSchoolScoreFields: HighSchoolScoreField[] = [
  { label: "Điểm TB lớp 12", value: "0" },
  { label: "Số báo danh" },
  { label: "Điểm học bạ CRM tính (TB điểm)", value: "0" },
  { label: "Điểm chi tiết (JSON)" },
  { label: "Tổng điểm xét tuyển (ĐXT + ưu tiên + KK)" },
  { label: "Tên loại điểm khuyến khích" },
  { label: "Số điểm khuyến khích" },
  { label: "Tên loại ưu tiên đối tượng" },
  { label: "Điểm ưu tiên đối tượng" },
];

export default function StudentHighSchoolScoreMockup() {
  return (
    <Card className="h-full p-5">
      <StudentCardHeader
        description="Các điểm số và tiêu chí dùng để xét tuyển."
        icon={<BarChart2 size={18} aria-hidden="true" />}
        title="Điểm THPT"
      />

      <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        {highSchoolScoreFields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-xs text-text-tertiary">{field.label}</dt>
            <dd className="mt-1 break-words text-sm font-medium text-text-primary">
              {field.value || "-"}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
