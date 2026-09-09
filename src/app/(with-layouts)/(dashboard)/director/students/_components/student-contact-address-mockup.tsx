"use client";

import { MapMarker5 } from "@tailgrids/icons";

import { Card } from "@/components/tailgrids/core/card";

import StudentCardHeader from "./student-card-header";

interface ContactAddressField {
  label: string;
  value: string;
}

const contactAddressFields: ContactAddressField[] = [
  { label: "Tỉnh/ TP", value: "Thành phố Hồ Chí Minh" },
  { label: "Phường/Xã", value: "Phường Khánh Hội" },
  {
    label: "Địa chỉ liên hệ đầy đủ thí sinh",
    value: "307/9 Tôn Đản, Khu phố 15, Phường Khánh Hội, Thành phố Hồ Chí Minh",
  },
];

export default function StudentContactAddressMockup() {
  return (
    <Card className="p-5">
      <StudentCardHeader
        description="Địa chỉ liên hệ hiện tại được lưu trên hồ sơ học sinh."
        icon={<MapMarker5 size={18} aria-hidden="true" />}
        title="Thông tin địa chỉ liên hệ"
      />

      <dl className="grid gap-x-8 gap-y-5 md:grid-cols-3">
        {contactAddressFields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-xs text-text-tertiary">{field.label}</dt>
            <dd className="mt-1 break-words text-sm font-medium text-text-primary">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
