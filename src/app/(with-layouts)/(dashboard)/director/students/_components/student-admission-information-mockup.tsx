"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

interface AdmissionInformationField {
  label: string;
  value?: string;
}

const admissionInformationFields: AdmissionInformationField[] = [
  { label: "Mã hồ sơ TĐK", value: "14127" },
  { label: "Nơi đăng ký học", value: "TP. Hồ Chí Minh" },
  {
    label: "Phương thức xét tuyển",
    value: "Xét tuyển thẳng / Ưu tiên xét tuyển",
  },
  {
    label: "Hình thức xét tuyển thẳng",
    value: "Cao đẳng FPT Polytechnic",
  },
  { label: "Bước đăng ký", value: "6" },
  { label: "Nguyện vọng FPT", value: "Nguyện vọng khác" },
  { label: "Địa chỉ phụ huynh/người liên hệ" },
  { label: "Email phụ huynh" },
];

export default function StudentAdmissionInformationMockup() {
  return (
    <Card className="p-5">
      <CardHeader className="mb-6">
        <CardTitle>Thông tin tuyển sinh</CardTitle>
      </CardHeader>

      <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        {admissionInformationFields.map((field) => (
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
