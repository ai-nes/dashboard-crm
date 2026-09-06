"use client";

import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import type { DirectorNbaRecommendation } from "@/services/api/nba";
import {
  formatNbaDateTime,
  formatNbaDecisionStatus,
  formatNbaExecutionStatus,
  formatNbaLifecycle,
} from "@/services/api/nba/presentation";

interface DirectorRecommendationDetailProps {
  recommendation: DirectorNbaRecommendation | null;
  studentNameById: ReadonlyMap<string, string>;
}

const priorityLabels = {
  high: "Cao",
  medium: "Vừa",
  low: "Thấp",
} as const;

const priorityColors = {
  high: "error",
  medium: "primary",
  low: "gray",
} as const;

export default function DirectorRecommendationDetail({
  recommendation,
  studentNameById,
}: DirectorRecommendationDetailProps) {
  if (!recommendation) {
    return (
      <section
        className="flex min-h-[360px] items-center justify-center p-8 text-center"
        aria-label="Chi tiết đề xuất NBA"
      >
        <p className="max-w-sm text-sm leading-6 text-text-secondary">
          Chọn một việc để xem mục tiêu và căn cứ.
        </p>
      </section>
    );
  }

  const studentName =
    recommendation.studentName ??
    studentNameById.get(recommendation.target.id) ??
    recommendation.target.id;
  const objective =
    (recommendation.objective ?? recommendation.reason) ||
    "Chưa có mục tiêu cho đề xuất này.";
  const href = `/director/students/${encodeURIComponent(recommendation.target.id)}?tab=decision`;

  return (
    <section
      aria-label="Chi tiết đề xuất NBA"
      className="min-w-0 p-5 sm:p-6 xl:sticky xl:top-4 xl:self-start"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tabular-nums text-text-tertiary">
          #{recommendation.rank}
        </span>
        <Badge color={priorityColors[recommendation.priority]}>
          {priorityLabels[recommendation.priority]}
        </Badge>
        <Badge
          color={
            recommendation.status.decision === "pending" ? "primary" : "gray"
          }
        >
          {formatNbaDecisionStatus(recommendation.status.decision)}
        </Badge>
      </div>

      <h2 className="mt-4 text-xl leading-7 font-semibold text-text-primary">
        {recommendation.action.title}
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        {studentName}
        <span className="mx-1.5 text-text-tertiary" aria-hidden="true">
          ·
        </span>
        {recommendation.target.id}
      </p>

      <div className="mt-5 rounded-lg bg-background-soft-50 p-4">
        <p className="text-xs font-semibold text-text-tertiary">Mục tiêu</p>
        <p className="mt-1.5 break-words text-sm leading-6 text-text-primary">
          {objective}
        </p>
        {recommendation.objective && recommendation.reason && (
          <p className="mt-2 break-words text-xs leading-5 text-text-secondary">
            Tín hiệu: {recommendation.reason}
          </p>
        )}
      </div>

      {recommendation.context.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold text-text-tertiary">Căn cứ</p>
          <ul className="mt-2 space-y-2 text-sm leading-5 text-text-secondary">
            {recommendation.context.slice(0, 3).map((fact) => (
              <li key={fact} className="flex gap-2">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-500"
                  aria-hidden="true"
                />
                <span className="break-words">{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 grid gap-3 border-t border-card-border pt-4 sm:grid-cols-2">
        <TimingField
          label="Thực hiện từ"
          value={formatNbaDateTime(recommendation.timing.scheduledAt)}
        />
        <TimingField
          label="Hạn xử lý"
          value={formatNbaDateTime(recommendation.timing.expiresAt)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge color="gray">
          {formatNbaLifecycle(recommendation.status.lifecycle)}
        </Badge>
        <Badge color="gray">
          {formatNbaExecutionStatus(recommendation.status.execution)}
        </Badge>
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 outline-none hover:text-primary-700 focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring dark:text-primary-300 dark:hover:text-primary-200"
      >
        Mở hồ sơ
      </Link>
    </section>
  );
}

function TimingField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-text-tertiary">{label}</p>
      <p className="mt-1 break-words text-sm text-text-primary">{value}</p>
    </div>
  );
}
