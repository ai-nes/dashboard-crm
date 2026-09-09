"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

interface ContactInformationField {
  label: string;
  value?: string;
}

const contactInformationFields: ContactInformationField[] = [
  { label: "Họ và tên người liên hệ", value: "Nguyễn Thị Ngọc Tuyền" },
  { label: "Số điện thoại", value: "0936530614" },
  { label: "Số điện thoại khác (nếu có)" },
  { label: "Email", value: "nnguyenthi936@gmail.com" },
  { label: "Tên ngân hàng", value: "Ngân hàng TMCP Công thương Việt Nam" },
  { label: "Số tài khoản", value: "107887334659" },
  { label: "Tên chủ tài khoản", value: "Nguyễn Thế Phong" },
  { label: "Email cha" },
  { label: "Họ tên cha" },
  { label: "SĐT cha" },
  { label: "Nghề nghiệp cha" },
  { label: "SĐT mẹ" },
  { label: "Họ tên mẹ" },
  { label: "Email mẹ" },
  { label: "Nghề nghiệp mẹ" },
];

export default function StudentContactInformationMockup() {
  return (
    <Card className="p-5">
      <CardHeader className="mb-6">
        <CardTitle>Thông tin người liên hệ</CardTitle>
      </CardHeader>

      <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        {contactInformationFields.map((field) => (
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
