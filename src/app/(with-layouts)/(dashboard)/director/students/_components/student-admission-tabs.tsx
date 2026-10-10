"use client";

import type { DetailTabItem } from "@/components/common/detail-tabs";
import DetailTabs from "@/components/common/detail-tabs";
import { useAuth } from "@/components/common/auth/auth-provider";
import { getCrmDoctypePermissions } from "@/components/common/auth/permissions";

import StudentAdmissionDocumentsMockup from "./student-admission-documents-mockup";
import StudentAdmissionManagementMockup from "./student-admission-management-mockup";
import StudentPaymentInvoicesMockup from "./student-payment-invoices-mockup";
import type { Student360SectionProps } from "./types";

function getAdmissionTabs(
  data: Student360SectionProps["data"],
  canReadPaymentAccount: boolean,
): DetailTabItem[] {
  const tabs: DetailTabItem[] = [
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
  return canReadPaymentAccount
    ? tabs
    : tabs.filter((tab) => tab.id !== "payment-invoices");
}

export default function StudentAdmissionTabs({ data }: Student360SectionProps) {
  const { user } = useAuth();
  const canReadPaymentAccount = getCrmDoctypePermissions(
    user,
    "CRM Student Payment Account",
  ).canRead;
  const admissionTabs = getAdmissionTabs(data, canReadPaymentAccount);

  return (
    <DetailTabs
      ariaLabel="Các phần trong nhập học"
      defaultSelectedKey="admission-management"
      isSticky={false}
      tabs={admissionTabs}
    />
  );
}
