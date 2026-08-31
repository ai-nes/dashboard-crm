"use client";

import { toast } from "sonner";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { UpcomingFieldActivity } from "@/services/api/director-school-field-activity";

interface UpcomingActivityPlanProps {
  activities: UpcomingFieldActivity[];
}

export default function UpcomingActivityPlan({ activities }: UpcomingActivityPlanProps) {
  const visibleActivities = activities.filter((activity) => activity.status !== "cancelled");

  return (
    <Card className="min-w-0 p-5">
      <CardHeader className="mb-4 items-start">
        <div>
          <CardTitle>Kế hoạch sắp tới</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">Trường được ưu tiên từ dữ liệu thị trường và hồ sơ học sinh.</p>
        </div>
        <Badge color="gray">{visibleActivities.length} kế hoạch</Badge>
      </CardHeader>

      <div className="space-y-3">
        {visibleActivities.length ? visibleActivities.map((activity) => (
          <div key={activity.id} className="rounded-lg bg-background-soft-50 p-3.5">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary">{activity.title}</p>
                <p className="mt-1 text-xs text-text-tertiary">{activity.location}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-text-secondary">{activity.dateLabel ?? formatDate(activity.scheduledAt)}</span>
            </div>
            <div className="mt-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-text-tertiary">Dự báo nhập học</span>
                <span className="text-right font-semibold text-text-primary">{formatExpectedEnrollment(activity)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-text-tertiary">Độ tin cậy</span>
                <span className="font-semibold text-success-500">{activity.confidence === null ? "—" : `${activity.confidence}%`}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background-soft-200" aria-hidden="true">
                <div className="h-full rounded-full bg-success-500" style={{ width: `${activity.confidence ?? 0}%` }} />
              </div>
            </div>
          </div>
        )) : <p className="rounded-lg border border-dashed border-card-border px-3 py-5 text-sm text-text-tertiary">Chưa có kế hoạch sắp tới.</p>}
      </div>

      <Button appearance="outline" className="mt-4 w-full" size="sm" onPress={() => toast.success("Đã ghi nhận yêu cầu lập kế hoạch hoạt động mới.")}>
        Lập kế hoạch hoạt động mới
      </Button>
    </Card>
  );
}

function formatExpectedEnrollment(activity: UpcomingFieldActivity): string {
  const { min, max } = activity.expectedEnrollment;
  if (min === null && max === null) return "—";
  if (min === null) return `Tối đa ${max} học sinh`;
  if (max === null) return `Từ ${min} học sinh`;
  return `+${min} đến +${max} học sinh`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}
