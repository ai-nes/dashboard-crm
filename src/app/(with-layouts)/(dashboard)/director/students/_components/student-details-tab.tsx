import { CheckCircle1, Envelope1, MapMarker5, Phone } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { formatDateTime } from "@/utils/format-date";
import type { StudentContactConsent } from "@/services/api/students/types";

import type { Student360SectionProps } from "./types";

export default function StudentDetailsTab({ data }: Student360SectionProps) {
  const { student } = data;
  const verificationStatus = student.verificationStatus || "Chưa xác thực";
  const contactConsent = student.contactConsent;
  const consentIsGranted = contactConsent?.status === "Đã đồng ý";
  const updatedAt = student.lastUpdatedAt
    ? formatDateTime(student.lastUpdatedAt)
    : "-";

  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-2">
      <Card className="h-full p-5">
        <CardHeader className="mb-5">
          <CardTitle>Thông tin cá nhân</CardTitle>
          <Badge color={getVerificationColor(verificationStatus)}>
            <CheckCircle1 size={13} />
            {verificationStatus}
          </Badge>
        </CardHeader>
        <div>
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-text-tertiary">Họ và tên</dt>
              <dd className="mt-1 text-sm font-medium text-text-primary">
                {student.name || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Mã hồ sơ</dt>
              <dd className="mt-1 text-sm font-medium text-text-primary">
                {student.code || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Ngày sinh</dt>
              <dd className="mt-1 text-sm font-medium text-text-primary">
                {data.profile?.find((p) => p.label === "Ngày sinh")?.value ||
                  "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Giới tính</dt>
              <dd className="mt-1 text-sm font-medium text-text-primary">
                {data.profile?.find((p) => p.label === "Giới tính")?.value ||
                  "-"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-text-tertiary">Trường THPT</dt>
              <dd className="mt-1 flex items-start gap-1.5 text-sm font-medium text-text-primary">
                <MapMarker5 size={15} className="mt-0.5 text-icon-tertiary" />
                {student.school || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Số điện thoại</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-text-primary">
                <Phone size={14} className="text-icon-tertiary" />
                {student.phone || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Email</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-text-primary">
                <Envelope1 size={14} className="text-icon-tertiary" />
                {student.email || "-"}
              </dd>
            </div>
          </dl>
          {contactConsent && (
            <div
              className={`mt-5 flex items-center justify-between gap-3 rounded-xl p-3 ${consentIsGranted ? "bg-badge-success-background" : "bg-badge-warning-background"}`}
            >
              <p
                className={`text-xs font-medium ${consentIsGranted ? "text-badge-success-text" : "text-badge-warning-text"}`}
              >
                {formatConsentMessage(contactConsent)}
              </p>
              <Badge color={consentIsGranted ? "success" : "warning"}>
                {contactConsent.status}
              </Badge>
            </div>
          )}
        </div>
      </Card>
      <Card className="h-full border-info-500/20 p-5">
        <CardHeader className="mb-5">
          <CardTitle>Học tập & định hướng</CardTitle>
          <Badge color="sky">Phù hợp cao</Badge>
        </CardHeader>
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          {[
            ...data.academics,
            { label: "Lớp hiện tại", value: student.grade || "-" },
            { label: "Nguyện vọng ưu tiên", value: student.major || "-" },
            { label: "Khu vực", value: student.province || "-" },
            { label: "Cập nhật gần nhất", value: updatedAt },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-xs text-text-tertiary">{item.label}</dt>
              <dd className="mt-1 text-sm font-medium text-text-primary">
                {item.value || "-"}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}

function formatConsentMessage(consent: StudentContactConsent) {
  const channels = consent.channels.filter((channel) => channel !== "Zalo");
  return channels.length
    ? `Trạng thái liên hệ: ${channels.join(" và ")}.`
    : "Chưa ghi nhận kênh liên hệ được phép.";
}

function getVerificationColor(status: string) {
  if (status === "Đã xác thực") return "success" as const;
  if (status === "Cần xác minh") return "warning" as const;
  return "gray" as const;
}
