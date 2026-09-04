"use client";

import { ArrowRight } from "@tailgrids/icons";
import Link from "next/link";

import { Badge } from "@/components/tailgrids/core/badge";
import type { DirectorNbaRecommendation } from "@/services/api/nba";
import {
  actionLabel,
  formatNbaChannel,
  formatNbaDateTime,
} from "@/services/api/nba/presentation";

interface DirectorRecommendationDetailProps {
  recommendation: DirectorNbaRecommendation | null;
  studentNameById: ReadonlyMap<string, string>;
}

const priorityLabels = {
  high: "Ưu tiên cao",
  medium: "Ưu tiên vừa",
  low: "Ưu tiên thấp",
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
        className="flex min-h-[420px] items-center justify-center p-8 text-center"
        aria-label="Chi tiết đề xuất NBA"
      >
        <p className="max-w-sm text-sm leading-6 text-text-secondary">
          Chọn một đề xuất để xem dữ liệu trả về.
        </p>
      </section>
    );
  }

  const studentName =
    recommendation.studentName ?? studentNameById.get(recommendation.studentId);

  return (
    <section aria-label="Chi tiết đề xuất NBA" className="min-w-0">
      <div className="border-b border-card-border p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="primary">#{recommendation.rank}</Badge>
          <Badge color={priorityColors[recommendation.priority]}>
            {priorityLabels[recommendation.priority]}
          </Badge>
          <span className="text-xs text-text-tertiary">
            {formatNbaDateTime(recommendation.generatedAt)}
          </span>
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {studentName && <DataField label="Học sinh" value={studentName} />}
          <DataField
            label="Mã hồ sơ học sinh"
            value={recommendation.studentId}
          />
          <DataField
            label="Hành động tuyển sinh"
            value={actionLabel(recommendation.actionId)}
          />
          {recommendation.channel && (
            <DataField
              label="Kênh liên hệ"
              value={formatNbaChannel(recommendation.channel)}
            />
          )}
          <DataField
            label="Trạng thái đánh giá"
            value={formatEvaluationStatus(recommendation.evaluation.status)}
          />
          <DataField
            label="Kết luận"
            value={formatDisposition(recommendation.evaluation.disposition)}
          />
        </dl>

        {recommendation.reason && (
          <div className="mt-5 border-t border-card-border pt-4">
            <p className="text-xs font-semibold text-text-tertiary">
              Lý do đề xuất
            </p>
            <p className="mt-1.5 text-sm leading-6 text-text-secondary">
              {recommendation.reason}
            </p>
          </div>
        )}

        <Link
          href={`/director/students/${encodeURIComponent(recommendation.studentId)}?tab=decision`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 outline-none hover:text-primary-700 focus-visible:rounded-md focus-visible:ring-4 focus-visible:ring-button-primary-focus-ring dark:text-primary-300 dark:hover:text-primary-200"
        >
          Mở hồ sơ và ghi nhận quyết định
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function formatEvaluationStatus(value: string): string {
  const labels: Record<string, string> = {
    completed: "Đã hoàn tất",
    running: "Đang đánh giá",
    queued: "Đang chờ đánh giá",
    failed: "Đánh giá không thành công",
  };

  return labels[value] ?? (value === "unknown" ? "Chưa xác định" : value);
}

function formatDisposition(
  value: DirectorNbaRecommendation["evaluation"]["disposition"],
): string {
  const labels = {
    RECOMMEND: "Đề xuất hành động",
    WAIT: "Chờ thêm tín hiệu",
    NO_ACTION: "Chưa cần hành động",
    ABSTAIN: "Chưa đủ dữ kiện",
  } as const;

  return labels[value];
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-text-tertiary">{label}</dt>
      <dd className="mt-1 break-words text-sm text-text-primary">{value}</dd>
    </div>
  );
}
