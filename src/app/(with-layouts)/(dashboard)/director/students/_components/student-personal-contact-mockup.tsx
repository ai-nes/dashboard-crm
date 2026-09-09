"use client";

import { UserCircle1 } from "@tailgrids/icons";

import { Card } from "@/components/tailgrids/core/card";

import StudentContactAddressMockup from "./student-contact-address-mockup";
import StudentContactInformationMockup from "./student-contact-information-mockup";
import StudentCardHeader from "./student-card-header";

interface PersonalContactField {
  label: string;
  value?: string;
  href?: string;
}

const personalContactFields: PersonalContactField[] = [
  { label: "Họ và Tên", value: "Nguyễn Thế Phong" },
  { label: "Ngày sinh", value: "2006-03-03" },
  { label: "Giới tính", value: "Nam" },
  { label: "CCCD/Passport", value: "079206000566" },
  { label: "Nơi sinh", value: "TP. Hồ Chí Minh" },
  { label: "Dân tộc", value: "Kinh" },
  { label: "Tôn giáo", value: "Không" },
  { label: "Quốc tịch", value: "Việt Nam" },
  { label: "Ngày cấp", value: "2021-12-20" },
  {
    label: "Nơi cấp",
    value: "Cục trưởng cục cảnh sát quản lý hành chính về trật tự xã hội",
  },
  { label: "Di Động", value: "0768086591" },
  { label: "ĐT khác" },
  { label: "Email", value: "pn26608@gmail.com" },
  { label: "Email khác" },
  { label: "Nguồn" },
  { label: "Nguồn input", value: "CRM" },
  { label: "Giao cho", value: "Huỳnh Ngân" },
  { label: "Chuyển đổi từ Đầu mối", value: "Không" },
  {
    label: "Chuyển từ Lead",
    value: "Nguyễn Thế Phong",
    href: "https://v84.ptudcrm.io.vn/index.php?module=Leads&view=Detail&record=46689",
  },
  {
    label: "Ngành học",
    value: "Kỹ thuật phần mềm",
    href: "https://v84.ptudcrm.io.vn/index.php?module=Majors&view=Detail&record=3721",
  },
  { label: "Năm tuyển sinh", value: "2026" },
  { label: "Chi nhánh", value: "TP. Hồ Chí Minh" },
  { label: "Ngày tạo", value: "2026-08-12 10:48 PM" },
  { label: "Ngày sửa", value: "2026-09-09 3:10 PM" },
];

export default function StudentPersonalContactMockup() {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <StudentCardHeader
          description="Thông tin định danh và hồ sơ liên hệ chính của học sinh."
          icon={<UserCircle1 size={18} aria-hidden="true" />}
          title="Thông tin cá nhân"
        />

        <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
          {personalContactFields.map((field) => (
            <div key={field.label} className="min-w-0">
              <dt className="text-xs text-text-tertiary">{field.label}</dt>
              <dd className="mt-1 break-words text-sm font-medium text-text-primary">
                {field.href && field.value ? (
                  <a
                    className="text-primary-500 underline-offset-2 hover:underline"
                    href={field.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {field.value}
                  </a>
                ) : (
                  field.value || "-"
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <StudentContactInformationMockup />
      <StudentContactAddressMockup />
    </div>
  );
}
