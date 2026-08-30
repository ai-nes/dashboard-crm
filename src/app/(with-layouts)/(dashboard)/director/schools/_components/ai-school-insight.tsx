"use client";

import { Calendar, CheckCircle1, MapMarker5 } from "@tailgrids/icons";
import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { SchoolClassification, SchoolIntelligenceData } from "@/services/api/schools/types";

interface SchoolActionPlanProps {
  data: SchoolIntelligenceData;
}

const groupTone: Record<SchoolClassification, { badge: "success" | "primary" | "warning" | "gray"; surface: string; action: string }> = {
  "Trọng điểm": { badge: "success", surface: "bg-badge-success-background", action: "Mở rộng hoạt động theo mùa" },
  "Mở rộng": { badge: "primary", surface: "bg-badge-primary-background", action: "Mở đầu mối với nhà trường" },
  "Duy trì": { badge: "warning", surface: "bg-badge-warning-background", action: "Giữ nhịp chăm sóc tối thiểu" },
  "Sàng lọc": { badge: "gray", surface: "bg-badge-neutral-background", action: "Rà soát trước khi đầu tư thêm" },
};

export default function SchoolActionPlan({ data }: SchoolActionPlanProps) {
  const { classification, relationship, geography } = data;
  const tone = groupTone[classification.group];
  const hasContact = relationship.contact !== "Chưa có đầu mối chính";

  const steps = hasContact
    ? [
        { title: "Chốt lịch với đầu mối", detail: relationship.nextTouch },
        { title: "Chạy hoạt động đúng cụm", detail: "Ưu tiên nhóm học sinh khả dụng" },
        { title: "Đo nhập học sau hoạt động", detail: "Ghi nhận theo từng loại hoạt động" },
      ]
    : [
        { title: "Xác định đầu mối nhà trường", detail: "Gọi phòng công tác học sinh hoặc ban giám hiệu" },
        { title: "Thử hoạt động chi phí thấp", detail: "Career Talk / tư vấn nhóm nhỏ" },
        { title: "Đánh giá lại sau mùa", detail: "So sánh quan hệ và số học sinh khả dụng" },
      ];

  return (
    <Card className="flex min-w-0 flex-col overflow-hidden p-0">
      <CardHeader className="border-b border-card-border p-5 pb-4 lg:p-6 lg:pb-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={"flex size-9 shrink-0 items-center justify-center rounded-xl " + tone.surface + " text-badge-primary-text"} aria-hidden="true"><Calendar size={18} /></span>
          <div className="min-w-0">
            <CardTitle>Ưu tiên triển khai</CardTitle>
            <p className="mt-1 text-xs leading-5 text-text-tertiary">Nguồn lực nên được đặt vào đâu ở trường này?</p>
          </div>
        </div>
        <Badge color={tone.badge}>{tone.action}</Badge>
      </CardHeader>

      <div className="flex flex-1 flex-col p-5 lg:p-6">
        <div className="rounded-2xl bg-background-soft-50 p-4">
          <p className="text-xs font-medium text-text-tertiary">Kết luận vận hành</p>
          <p className="mt-2 text-xl font-semibold leading-7 text-text-primary">{classification.action}</p>
          <p className="mt-2 text-sm leading-5 text-text-secondary">Trường có <strong className="font-semibold text-text-primary">{data.availableStudents.toLocaleString("vi-VN")} học sinh khả dụng</strong>, thuộc {geography.cluster.toLocaleLowerCase("vi-VN")} và cách campus {geography.travelTime}.</p>
        </div>

        <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <InfoItem label="Quan hệ hiện tại" value={relationship.level} />
          <InfoItem label="Mật độ cạnh tranh" value={geography.competitionDensity} />
          <InfoItem label="Đầu mối" value={relationship.contact} />
          <InfoItem label="Lần chạm tiếp theo" value={relationship.nextTouch} />
        </div>

        <div className="mt-5 border-t border-card-border pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Lộ trình 30 ngày</h3>
              <p className="mt-1 text-xs text-text-tertiary">Ba việc để biến phân loại thành kế hoạch địa bàn.</p>
            </div>
            <Badge color="primary">3 việc</Badge>
          </div>
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
          <Button onPress={() => toast.success("Đã tạo lịch làm việc cho " + data.school.name + ".")}><Calendar size={16} />Đặt lịch làm việc</Button>
          <Button appearance="outline" onPress={() => toast.message("Đã mở mẫu kế hoạch khai thác theo cụm.")}><MapMarker5 size={16} />Mở kế hoạch cụm</Button>
        </div>

        <p className="mt-4 flex items-start gap-1.5 text-xs leading-5 text-text-tertiary"><CheckCircle1 size={14} className="mt-0.5 shrink-0 text-success-500" />Đề xuất dựa trên phân loại trường, dữ liệu địa bàn và lịch sử quan hệ.</p>
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
