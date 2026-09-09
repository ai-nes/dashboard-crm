"use client";

import { Book4 } from "@tailgrids/icons";

import { Card } from "@/components/tailgrids/core/card";

import StudentCardHeader from "./student-card-header";

interface HighSchoolField {
  label: string;
  value?: string;
}

const highSchoolFields: HighSchoolField[] = [
  { label: "Tỉnh/TP Trường (mới)", value: "Tp. Hồ Chí Minh" },
  {
    label: "Trường THPT (mới)",
    value: "Phổ thông Cao đẳng FPT Polytechnic",
  },
  { label: "Phường/Xã (mới)" },
  { label: "Khu Vực", value: "KV3" },
  { label: "Điểm tốt nghiệp THPT", value: "0.00" },
  { label: "Đã tốt nghiệp THPT", value: "Không" },
  { label: "Năm tốt nghiệp THPT", value: "2026" },
  { label: "Loại học lực" },
  { label: "Đối tượng ưu tiên" },
  { label: "Xếp loại tốt nghiệp THPT" },
  { label: "Loại hạnh kiểm" },
];

export default function StudentHighSchoolMockup() {
  return (
    <Card className="h-full p-5">
      <StudentCardHeader
        description="Thông tin trường, khu vực và kết quả tốt nghiệp THPT."
        icon={<Book4 size={18} aria-hidden="true" />}
        title="Thông tin trường THPT"
      />

      <dl className="grid gap-x-10 gap-y-5 md:grid-cols-2">
        {highSchoolFields.map((field) => (
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
