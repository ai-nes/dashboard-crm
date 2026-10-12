"use client";

import { FileText } from "@tailgrids/icons";

import { Card } from "@/components/tailgrids/core/card";
import type { StudentAdmissionProfile } from "@/services/api/students/types";

import StudentCardHeader from "./student-card-header";
import StudentEnrollmentInformationMockup from "./student-enrollment-information-mockup";

interface AdmissionManagementField {
  label: string;
  value?: string;
}

const admissionManagementFields: AdmissionManagementField[] = [
  {
    label: "Tình trạng nhập học",
  },
  {
    label: "Tình trạng hồ sơ nhập học",
  },
  { label: "Đủ điều kiện tạo MSSV" },
  { label: "Ngày đăng ký nhập học" },
  {
    label: "Tham chiếu nhập học",
  },
  { label: "Danh sách minh chứng TS thiếu" },
  { label: "Số tiền nhập học" },
  {
    label: "Ghi chú (nhập học)",
  },
  {
    label: "Tham chiếu nhập học (bổ sung)",
  },
  { label: "Ngày nhận phí booking" },
  { label: "Số tiền nhập học (bổ sung)" },
  { label: "Ngày nhận học phí" },
  { label: "Thuộc khu vực 1" },
  { label: "Học phí" },
  { label: "Mã số sinh viên" },
  { label: "Họ và tên anh/chị/em" },
  { label: "Ngày hóa đơn (nhập học)" },
  { label: "Loại học bổng" },
  { label: "Ngày hoá đơn (bổ sung)" },
  { label: "Loại ưu đãi" },
  { label: "Tài khoản sv nộp tiền tới (NB)" },
  { label: "Số tiền ưu đãi (VNĐ)" },
  { label: "Mã số bản cứng" },
  { label: "Thế hệ 1" },
  { label: "Tham chiếu nhập học (Anh văn)" },
  { label: "Người thân làm/học tại FE" },
  { label: "Tài khoản sv nộp tiền tới (NE)" },
  { label: "Ưu đãi gắn kết FE" },
  { label: "Mã sinh viên anh/chị/em" },
  { label: "Số tiền giảm trừ UD gắn kết FE" },
  { label: "Diện nhập học" },
  { label: "Người thân làm ở FPT" },
  { label: "Điều kiện ưu tiên xét tuyển" },
  { label: "Mức ưu đãi (%)" },
  { label: "Mức học bổng (%)" },
];

export default function StudentAdmissionManagementMockup({
  profile,
}: {
  profile?: Pick<
    StudentAdmissionProfile,
    "enrollmentStatus" | "profileStatus"
  > | null;
}) {
  const enrollmentLabels: Record<string, string> = {
    "Not Started": "Chưa nhập học",
    "In Progress": "Đang làm thủ tục nhập học",
    Eligible: "Đủ điều kiện nhập học",
    Enrolled: "Đã nhập học",
    Cancelled: "Đã hủy nhập học",
  };
  const profileLabels: Record<string, string> = {
    Draft: "Bản nháp",
    Active: "Đang hoàn thiện hồ sơ",
    Completed: "Đã hoàn thành hồ sơ",
    Archived: "Đã lưu trữ",
  };
  const fields = admissionManagementFields.map((field) => ({
    ...field,
    value:
      field.label === "Tình trạng nhập học"
        ? profile
          ? (enrollmentLabels[profile.enrollmentStatus] ?? "Chưa có thông tin")
          : "Chưa nhập học"
        : field.label === "Tình trạng hồ sơ nhập học"
          ? profile
            ? (profileLabels[profile.profileStatus] ?? "Chưa có thông tin")
            : undefined
          : undefined,
  }));
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <StudentCardHeader
          description="Trạng thái hồ sơ, tài chính và điều kiện nhập học."
          icon={<FileText size={18} aria-hidden="true" />}
          title="Thông tin quản lí nhập học"
        />

        <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
          {fields.map((field) => (
            <div key={field.label} className="min-w-0">
              <dt className="text-xs text-text-tertiary">{field.label}</dt>
              <dd className="mt-1 break-words text-sm font-medium text-text-primary">
                {field.value || "-"}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <StudentEnrollmentInformationMockup />
    </div>
  );
}
