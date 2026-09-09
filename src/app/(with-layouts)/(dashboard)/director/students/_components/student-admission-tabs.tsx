"use client";

import type { DetailTabItem } from "@/components/common/detail-tabs";
import DetailTabs from "@/components/common/detail-tabs";

import StudentAdmissionDocumentsMockup from "./student-admission-documents-mockup";
import StudentAdmissionManagementMockup from "./student-admission-management-mockup";
import StudentPaymentInvoicesMockup from "./student-payment-invoices-mockup";
import type { Student360SectionProps } from "./types";

function getAdmissionTabs(
  data: Student360SectionProps["data"],
): DetailTabItem[] {
  return [
    {
      id: "admission-management",
      label: "Thông tin quản lí nhập học",
      content: <StudentAdmissionManagementMockup />,
    },
    {
      id: "admission-documents",
      label: "Thủ tục và Hồ sơ Nhập học",
      content: <StudentAdmissionDocumentsMockup data={data} />,
    },
    {
      id: "payment-invoices",
      label: "Hóa đơn thanh toán",
      content: <StudentPaymentInvoicesMockup />,
    },
  ];
}

export default function StudentAdmissionTabs({ data }: Student360SectionProps) {
  const admissionTabs = getAdmissionTabs(data);

  return (
    <DetailTabs
      ariaLabel="Các phần trong nhập học"
      defaultSelectedKey="admission-management"
      isSticky={false}
      tabs={admissionTabs}
    />
  );
}
