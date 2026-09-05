"use client";

import {
  ArrowRight,
  CheckCircle1,
  InfoTriangle,
  UserMultiple1,
} from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { useAssignment } from "./assignment-context";

const groups = [
  {
    status: "no_match",
    title: "Chưa có người phù hợp",
    description: "Cần chọn người phụ trách",
    action: "Xem để phân công",
    icon: UserMultiple1,
    tone: "warning",
  },
  {
    status: "missing_data",
    title: "Thiếu thông tin",
    description: "Cần bổ sung khu vực",
    action: "Bổ sung thông tin",
    icon: InfoTriangle,
    tone: "warning",
  },
  {
    status: "error",
    title: "Lỗi tự động",
    description: "Cần kiểm tra execution",
    action: "Xem để xử lý",
    icon: InfoTriangle,
    tone: "warning",
  },
] as const;

export default function ReviewQueue() {
  const { records, summary, inspect, setFilter } = useAssignment();
  const count = summary?.pending ?? 0;
  return (
    <section aria-labelledby="review-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="review-heading"
          className="flex items-center gap-2 text-base font-semibold text-text-primary"
        >
          Cần bạn xử lý{" "}
          <Badge color={count ? "warning" : "success"}>{count}</Badge>
        </h2>
        <p className="text-xs text-text-tertiary">
          Ưu tiên học sinh đang chờ phân công
        </p>
      </div>
      {count === 0 ? (
        <Card className="flex items-center gap-3 py-5 text-sm text-badge-success-text">
          <CheckCircle1 size={20} />
          Đã xử lý hết các trường hợp trong snapshot hiện tại.
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {groups.map((group) => {
            const items = records.filter(
              (record) => record.status === group.status,
            );
            const Icon = group.icon;
            return (
              <Card key={group.status} className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="flex size-9 items-center justify-center rounded-lg bg-badge-warning-background text-badge-warning-text"
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="text-2xl font-semibold tabular-nums text-text-primary">
                    {summary?.byStatus[group.status] ?? 0}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-text-primary">
                  {group.title}
                </h3>
                <p className="mt-1 text-xs text-text-tertiary">
                  {group.description}
                </p>
                <p className="mt-3 flex-1 text-xs leading-5 text-text-secondary">
                  {items.length
                    ? items.map((item) => item.name).join(" · ")
                    : "Không có trường hợp cần xử lý."}
                </p>
                <Button
                  appearance="ghost"
                  size="sm"
                  className="mt-3 justify-between px-0 text-text-secondary"
                  isDisabled={!items.length}
                  onPress={() => {
                    setFilter(group.status);
                    inspect(items[0].id);
                  }}
                >
                  {group.action}
                  <ArrowRight size={15} aria-hidden="true" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
