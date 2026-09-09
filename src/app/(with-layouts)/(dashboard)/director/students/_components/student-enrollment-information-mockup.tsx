"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

interface EnrollmentInformationField {
  label: string;
  value?: string;
}

const enrollmentInformationFields: EnrollmentInformationField[] = [
  { label: "Cho phép truy cập cổng thông tin KH", value: "Không" },
  { label: "Ngày bắt đầu hỗ trợ" },
  { label: "Ngày kết thúc hỗ trợ" },
];

export default function StudentEnrollmentInformationMockup() {
  return (
    <Card className="p-5">
      <CardHeader className="mb-6">
        <CardTitle>Thông tin nhập học</CardTitle>
      </CardHeader>

      <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        {enrollmentInformationFields.map((field) => (
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
