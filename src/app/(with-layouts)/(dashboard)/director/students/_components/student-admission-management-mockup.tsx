"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import StudentEnrollmentInformationMockup from "./student-enrollment-information-mockup";

interface AdmissionManagementField {
  label: string;
  value?: string;
}

const admissionManagementFields: AdmissionManagementField[] = [
  {
    label: "Tình trạng nhập học",
    value: "SINH VIÊN ĐẠI HỌC FPT",
  },
  {
    label: "Tình trạng hồ sơ nhập học",
    value: "Đã hoàn thành hồ sơ",
  },
  { label: "Đủ điều kiện tạo MSSV", value: "Có" },
  { label: "Ngày đăng ký nhập học" },
  {
    label: "Tham chiếu nhập học",
    value: "1/001;K26TAA-00038962",
  },
  { label: "Danh sách minh chứng TS thiếu" },
  { label: "Số tiền nhập học", value: "13446650" },
  {
    label: "Ghi chú (nhập học)",
    value: "TS yêu cầu qua email đổi địa chỉ liên hệ ngày 9/9",
  },
  {
    label: "Tham chiếu nhập học (bổ sung)",
    value: "1/001;K26TAA-00040980",
  },
  { label: "Ngày nhận phí booking" },
  { label: "Số tiền nhập học (bổ sung)", value: "7860000" },
  { label: "Ngày nhận học phí" },
  { label: "Thuộc khu vực 1", value: "Không" },
  { label: "Học phí" },
  { label: "Mã số sinh viên", value: "SE220398" },
  { label: "Họ và tên anh/chị/em" },
  { label: "Ngày hóa đơn (nhập học)", value: "2026-08-13" },
  { label: "Loại học bổng" },
  { label: "Ngày hoá đơn (bổ sung)", value: "2026-08-17" },
  { label: "Loại ưu đãi" },
  { label: "Tài khoản sv nộp tiền tới (NB)" },
  { label: "Số tiền ưu đãi (VNĐ)" },
  { label: "Mã số bản cứng" },
  { label: "Thế hệ 1", value: "Không" },
  { label: "Tham chiếu nhập học (Anh văn)" },
  { label: "Người thân làm/học tại FE", value: "Không" },
  { label: "Tài khoản sv nộp tiền tới (NE)" },
  { label: "Ưu đãi gắn kết FE", value: "Có" },
  { label: "Mã sinh viên anh/chị/em" },
  { label: "Số tiền giảm trừ UD gắn kết FE", value: "4893350" },
  { label: "Diện nhập học", value: "Bình thường" },
  { label: "Người thân làm ở FPT", value: "Không" },
  { label: "Điều kiện ưu tiên xét tuyển" },
  { label: "Mức ưu đãi (%)" },
  { label: "Mức học bổng (%)" },
];

export default function StudentAdmissionManagementMockup() {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardHeader className="mb-6">
          <CardTitle>Thông tin quản lí nhập học</CardTitle>
        </CardHeader>

        <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
          {admissionManagementFields.map((field) => (
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
