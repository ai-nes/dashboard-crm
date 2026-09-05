"use client";

import {
  ArrowDownward,
  Bolt1,
  CheckCircle1,
  ClockThree,
  InfoCircle,
} from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { useAssignment } from "./assignment-context";

export default function AssignmentHeader() {
  const { setFilter, summary, health, meta, isLoading } = useAssignment();
  const assigned = summary?.assigned ?? 0;
  const pending = summary?.pending ?? 0;
  const received = summary?.received ?? 0;
  const snapshotTime = meta?.asOf
    ? new Date(meta.asOf).toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";

  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-text-tertiary">
            <span>VẬN HÀNH TUYỂN SINH</span>
            <span aria-hidden="true">/</span>
            <span>PHÂN CÔNG</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-[28px]">
            Phân công học sinh
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Theo dõi phân công tự động và xử lý những trường hợp cần bạn hỗ trợ.
          </p>
        </div>
        <Button
          appearance="outline"
          size="md"
          className="shrink-0 border-card-border text-text-secondary"
          onPress={() => {
            setFilter("all");
            document
              .getElementById("assignment-history")
              ?.scrollIntoView({ block: "start" });
          }}
        >
          Xem lịch sử <ArrowDownward size={16} aria-hidden="true" />
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-card-border bg-card-background">
        <div className="grid divide-y divide-card-border sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div className="flex items-center gap-3 px-5 py-4 sm:border-r sm:border-card-border">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-badge-success-background text-badge-success-text">
              <Bolt1 size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Phân công tự động
              </p>
              <Badge
                color="success"
                className="mt-1 gap-1.5 px-0 bg-transparent"
              >
                <CheckCircle1 size={12} aria-hidden="true" />
                {health?.automationEnabled ? "Đang bật" : "Đang tạm dừng"}
              </Badge>
            </div>
          </div>
          {[
            {
              label: "Học sinh tiếp nhận",
              value: received,
              note: meta ? `Snapshot ${meta.admissionYear}` : "Đang tải snapshot",
            },
            {
              label: "Đã có người phụ trách",
              value: assigned,
              note: "Sẵn sàng chăm sóc",
            },
            {
              label: "Cần bạn xử lý",
              value: pending,
              note: "Bổ sung thông tin hoặc phân công",
            },
          ].map((item, index) => (
            <div
              key={item.label}
              className="px-5 py-4 xl:border-l xl:border-card-border"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-text-secondary">
                  {item.label}
                </span>
                <span
                  className={`text-2xl font-semibold tabular-nums ${index === 2 && pending > 0 ? "text-badge-warning-text" : "text-text-primary"}`}
                >
                  {item.value}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-tertiary">{item.note}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-card-border bg-background-gray-secondary/50 px-5 py-2.5 text-xs text-text-tertiary">
          <span className="inline-flex items-center gap-1.5">
            <InfoCircle size={14} aria-hidden="true" />
            {isLoading ? "Đang tải dữ liệu phân công…" : "Số liệu từ snapshot phân công hiện tại."}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockThree size={13} aria-hidden="true" />
            {snapshotTime}
          </span>
        </div>
      </div>
    </header>
  );
}
