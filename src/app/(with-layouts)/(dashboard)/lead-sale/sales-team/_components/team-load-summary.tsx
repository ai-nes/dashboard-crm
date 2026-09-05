import { ArrowRight, UserMultiple1 } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { healthColors, healthLabels } from "./mappings";
import type { TeamLoadSummaryData } from "./types";

interface TeamLoadSummaryProps {
  summary: TeamLoadSummaryData;
  asOf: string;
}

export default function TeamLoadSummary({
  summary,
  asOf,
}: TeamLoadSummaryProps) {
  const loadRateLabel =
    summary.loadRate === null ? "Chưa cấu hình" : `${summary.loadRate}% đã dùng`;

  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Phân bổ học sinh</CardTitle>
          <p className="mt-1 text-xs leading-5 text-text-tertiary">
            Số học sinh đang phụ trách so với khả năng tiếp nhận của đội.
          </p>
        </div>
        <Link
          href="#sales-team-list"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Xem danh sách
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </CardHeader>

      <div className="mt-5 flex items-end justify-between gap-3 rounded-xl bg-background-gray-secondary p-4">
        <div>
          <p className="text-xs text-text-tertiary">
            Đã phân bổ / khả năng tiếp nhận
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">
            {summary.assignedStudents}
            <span className="text-base font-normal text-text-tertiary">
              /{summary.totalCapacity}
            </span>
          </p>
        </div>
        <Badge
          color={
            summary.loadRate !== null && summary.loadRate >= 80
              ? "warning"
              : "success"
          }
        >
          {loadRateLabel}
        </Badge>
      </div>

      <div className="mt-5 space-y-3">
        {summary.topMembers.map((member) => {
          const load =
            member.loadRate === null ? "Chưa cấu hình" : `${member.loadRate}% đã dùng`;
          return (
            <div key={member.id} className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-badge-sky-background text-[10px] font-semibold text-badge-sky-text">
                {member.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {member.name}
                  </p>
                  <span className="shrink-0 text-xs tabular-nums text-text-secondary">
                    {member.activeStudents}/{member.capacity}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-text-tertiary">{load}</span>
                  <Badge color={healthColors[member.health]} size="sm">
                    {healthLabels[member.health]}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-text-tertiary">
        <UserMultiple1 size={14} aria-hidden="true" />
        Cập nhật lúc {formatAsOf(asOf)}.
      </p>
    </Card>
  );
}

function formatAsOf(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}
