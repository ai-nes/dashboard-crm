"use client";

import { Calendar } from "@tailgrids/icons";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolClassification, SchoolIntelligenceData } from "@/services/api/schools/types";

import { getSchoolLocalityContext } from "./school-locality-data";

interface SchoolActionPlanProps {
  data: SchoolIntelligenceData;
}

const groupTone: Record<SchoolClassification, { badge: "success" | "primary" | "warning" | "gray"; surface: string; label: string; title: string; detail: string }> = {
  "Trọng điểm": { badge: "success", surface: "bg-badge-success-background", label: "Ưu tiên cao", title: "Giữ quan hệ, tăng hoạt động", detail: "Giữ đầu mối, tăng hoạt động và học bổng." },
  "Mở rộng": { badge: "primary", surface: "bg-badge-primary-background", label: "Cần mở quan hệ", title: "Tạo đầu mối mới", detail: "Tìm đầu mối, thử một hoạt động nhỏ." },
  "Duy trì": { badge: "warning", surface: "bg-badge-warning-background", label: "Duy trì đều", title: "Giữ liên hệ đều", detail: "Gom hoạt động theo khu vực." },
  "Sàng lọc": { badge: "gray", surface: "bg-badge-neutral-background", label: "Theo dõi", title: "Chưa đầu tư thêm", detail: "Chờ trường có nhu cầu rõ ràng." },
};

export default function SchoolActionPlan({ data }: SchoolActionPlanProps) {
  const { classification, relationship, geography } = data;
  const locality = getSchoolLocalityContext(
    data.school,
    data.locality?.latitude !== null && data.locality?.latitude !== undefined && data.locality?.longitude !== null && data.locality?.longitude !== undefined
      ? [data.locality.latitude, data.locality.longitude]
      : undefined,
    data.locality,
  );
  const tone = groupTone[classification.group];
  const hasContact = Boolean(relationship.contact && !["-", "Chưa có đầu mối chính"].includes(relationship.contact));
  const availableStudents = data.availableStudents > 0 ? `${data.availableStudents.toLocaleString("vi-VN")} HS` : "-";

  const steps = hasContact
    ? [
        { title: "Chốt lịch làm việc", detail: relationship.nextTouch },
        { title: "Tổ chức hoạt động", detail: `${availableStudents} có thể tiếp cận` },
        { title: "Theo dõi hồ sơ", detail: "Kiểm tra số hồ sơ mới" },
      ]
    : [
        { title: "Tìm người phụ trách", detail: "Liên hệ ban giám hiệu hoặc giáo viên hướng nghiệp" },
        { title: "Thử hoạt động nhỏ", detail: "Career Talk hoặc tư vấn nhóm học sinh" },
        { title: "Đánh giá lại sau 30 ngày", detail: "So sánh số người tiếp cận và số hồ sơ" },
      ];

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden p-0">
      <CardHeader className="border-b border-card-border p-5 pb-4 lg:p-6 lg:pb-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={"flex size-9 shrink-0 items-center justify-center rounded-xl " + tone.surface + " text-badge-primary-text"} aria-hidden="true"><Calendar size={18} /></span>
          <div className="min-w-0">
            <CardTitle>Việc ưu tiên</CardTitle>
          </div>
        </div>
        <Badge color={tone.badge}>{tone.label}</Badge>
      </CardHeader>

      <div className="flex flex-1 flex-col p-5 lg:p-6">
        <div className="rounded-2xl border border-primary-200 bg-badge-primary-background p-4">
          <p className="text-xs font-medium text-text-tertiary">Việc cần làm ngay</p>
          <p className="mt-2 text-xl font-semibold leading-7 text-text-primary">{tone.title}</p>
          <p className="mt-2 text-sm leading-5 text-text-secondary">{tone.detail} <strong className="font-semibold text-text-primary">{availableStudents} có thể tiếp cận</strong> · {locality.distanceKm} km · {locality.travelTime}.</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
          <InfoItem label="Mức độ hợp tác" value={relationship.level} />
          <InfoItem label="Mức độ cạnh tranh" value={geography.competitionDensity} />
          <InfoItem label="Người phụ trách" value={relationship.contact} />
        </div>

        <div className="mt-5 border-t border-card-border pt-5">
          <h3 className="text-sm font-semibold text-text-primary">3 bước tiếp theo</h3>
          <ol className="mt-4 space-y-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className={stepTone(index)}>{index + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-text-secondary">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Button onPress={() => toast.success("Đã tạo lịch làm việc cho " + data.school.name + ".")}><Calendar size={16} />Đặt lịch</Button>
        </div>
      </div>
    </Card>
  );
}

function stepTone(index: number) {
  if (index === 0) return "flex size-7 shrink-0 items-center justify-center rounded-full bg-badge-primary-background text-xs font-semibold text-badge-primary-text";
  if (index === 1) return "flex size-7 shrink-0 items-center justify-center rounded-full bg-badge-warning-background text-xs font-semibold text-badge-warning-text";
  return "flex size-7 shrink-0 items-center justify-center rounded-full bg-badge-success-background text-xs font-semibold text-badge-success-text";
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-text-primary" title={value}>{value}</p>
    </div>
  );
}
