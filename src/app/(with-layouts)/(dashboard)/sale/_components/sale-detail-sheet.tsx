"use client";

import { Close } from "@tailgrids/icons";
import { useRouter } from "next/navigation";

import { Button } from "@/components/tailgrids/core/button";
import {
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from "@/components/tailgrids/core/sheet";

import LeadDetailPanel from "./lead-detail-panel";
import MetricDetailPanel from "./metric-detail-panel";
import type { SaleDashboardDetail } from "./sale-dashboard-detail.types";
import StudentDetailPanel from "./student-detail-panel";
import TaskDetailPanel from "./task-detail-panel";

interface SaleDetailSheetProps {
  detail: SaleDashboardDetail | null;
  isOpen: boolean;
  timezone: string;
  referenceDate: string;
  onOpenChange: (open: boolean) => void;
}

function getSheetCopy(detail: SaleDashboardDetail): {
  eyebrow: string;
  title: string;
  description: string;
} {
  switch (detail.kind) {
    case "task":
      return {
        eyebrow: `CÔNG VIỆC · ${detail.task.id}`,
        title: detail.task.title,
        description: `${detail.task.studentName} · Chi tiết và hạn xử lý`,
      };
    case "lead":
      return {
        eyebrow: `LEAD · ${detail.lead.leadCode}`,
        title: detail.lead.name,
        description: "Thông tin tiếp nhận và trạng thái xử lý Lead",
      };
    case "student":
      return {
        eyebrow: `HỌC SINH · ${detail.record.student.studentCode}`,
        title: detail.record.student.studentName,
        description: "Thông tin CRM và gợi ý hành động tiếp theo",
      };
    case "metric":
      switch (detail.metric) {
        case "enrollment":
          return {
            eyebrow: "CHỈ SỐ TUYỂN SINH",
            title: "Đã nhập học",
            description: "Kết quả nhập học so với chỉ tiêu kỳ này",
          };
        case "forecast":
          return {
            eyebrow: "CHỈ SỐ TUYỂN SINH",
            title: "Dự báo nhập học",
            description:
              "Kết quả hiện tại, pipeline dự kiến và độ phủ chỉ tiêu",
          };
        case "coverage":
          return {
            eyebrow: "CHỈ SỐ TUYỂN SINH",
            title: "Độ phủ chỉ tiêu",
            description: "Số dự kiến nhập học so với chỉ tiêu còn thiếu",
          };
        case "remaining":
          return {
            eyebrow: "CHỈ SỐ TUYỂN SINH",
            title: "Chỉ tiêu còn thiếu",
            description: "Khoảng cách giữa chỉ tiêu và số đã nhập học",
          };
        case "open-opportunities":
          return {
            eyebrow: "CHỈ SỐ TUYỂN SINH",
            title: "Cơ hội đang mở",
            description: "Quy mô pipeline chưa có kết quả cuối",
          };
        case "enrollment-rate":
          return {
            eyebrow: "CHỈ SỐ TUYỂN SINH",
            title: "Tỷ lệ nhập học",
            description: "Tỷ lệ tính trên các cơ hội đã có kết quả cuối",
          };
        case "lost-opportunities":
          return {
            eyebrow: "CHỈ SỐ TUYỂN SINH",
            title: "Cơ hội không chuyển đổi",
            description: "Số cơ hội đã đóng mà chưa trở thành học sinh",
          };
      }
  }
}

function getFullListTarget(
  detail: SaleDashboardDetail,
): { href: string; label: string } | null {
  switch (detail.kind) {
    case "task":
      return { href: "/sale/tasks", label: "Mở danh sách công việc" };
    case "lead":
      return { href: "/sale/leads", label: "Mở danh sách Lead" };
    case "student":
      return { href: "/sale/students", label: "Mở danh sách học sinh" };
    case "metric":
      return null;
  }
}

export default function SaleDetailSheet({
  detail,
  isOpen,
  timezone,
  referenceDate,
  onOpenChange,
}: SaleDetailSheetProps) {
  const router = useRouter();

  return (
    <SheetOverlay
      isOpen={isOpen && detail !== null}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="h-full w-full max-w-full gap-0 border-l border-card-border bg-card-background p-0 sm:max-w-2xl"
      >
        {detail ? (
          <>
            <div className="sticky top-0 z-20 flex shrink-0 items-start justify-between gap-4 border-b border-card-border bg-card-background px-5 py-4 sm:px-6">
              <SheetHeader className="min-w-0 gap-1">
                <p className="text-[10px] font-semibold tracking-[0.12em] text-text-tertiary">
                  {getSheetCopy(detail).eyebrow}
                </p>
                <SheetTitle className="mt-1 break-words text-base font-bold leading-6 text-text-primary">
                  {getSheetCopy(detail).title}
                </SheetTitle>
                <SheetDescription className="text-xs leading-5 text-text-tertiary">
                  {getSheetCopy(detail).description}
                </SheetDescription>
              </SheetHeader>
              <Button
                type="button"
                size="xs"
                variant="ghost"
                appearance="ghost"
                iconOnly
                onPress={() => onOpenChange(false)}
                aria-label="Đóng chi tiết"
                className="size-8 shrink-0"
              >
                <Close size={17} aria-hidden="true" />
              </Button>
            </div>

            <SheetBody className="min-h-0 flex-1 space-y-5 px-5 py-5 sm:px-6">
              {detail.kind === "task" ? (
                <TaskDetailPanel
                  task={detail.task}
                  timezone={timezone}
                  referenceDate={referenceDate}
                />
              ) : null}
              {detail.kind === "lead" ? (
                <LeadDetailPanel lead={detail.lead} timezone={timezone} />
              ) : null}
              {detail.kind === "student" ? (
                <StudentDetailPanel
                  record={detail.record}
                  timezone={timezone}
                />
              ) : null}
              {detail.kind === "metric" ? (
                <MetricDetailPanel
                  metric={detail.metric}
                  performance={detail.performance}
                />
              ) : null}
            </SheetBody>

            <SheetFooter className="shrink-0 border-t border-card-border bg-card-background px-5 py-4 sm:px-6">
              {getFullListTarget(detail) ? (
                <Button
                  type="button"
                  variant="primary"
                  appearance="fill"
                  className="w-full sm:w-auto"
                  onPress={() => {
                    const target = getFullListTarget(detail);
                    onOpenChange(false);
                    if (target) router.push(target.href);
                  }}
                >
                  {getFullListTarget(detail)?.label}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                appearance="outline"
                className="w-full sm:w-auto"
                onPress={() => onOpenChange(false)}
              >
                Đóng
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </SheetOverlay>
  );
}
