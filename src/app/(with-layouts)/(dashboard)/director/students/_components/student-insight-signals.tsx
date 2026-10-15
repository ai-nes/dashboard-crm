"use client";

import { Card } from "@/components/tailgrids/core/card";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import type { AiInsight, StudentAiLabels } from "@/services/api/student-ai";
import { getDimensionLabel } from "./student-analysis-display";

interface Props {
  insight?: AiInsight;
  labels?: StudentAiLabels;
  canRead: boolean;
  isLoading?: boolean;
  compact?: boolean;
}

export default function StudentInsightSignals({
  insight,
  labels,
  canRead,
  isLoading,
  compact = false,
}: Props) {
  if (!canRead) return null;
  const positives =
    insight?.positives?.filter((item) => item.text.trim()) ?? [];
  const missing =
    insight?.dimensions?.flatMap((dimension) =>
      (dimension.missing ?? [])
        .filter((item) => item.trim())
        .map((text) => ({
          label: getDimensionLabel(dimension.code, labels),
          text,
        })),
    ) ?? [];
  return (
    <div
      className={
        compact ? "grid min-w-0 gap-4" : "grid min-w-0 gap-4 lg:grid-cols-2"
      }
    >
      <Card className="min-w-0 p-4">
        <h2 className="text-base font-semibold text-text-primary">
          Tín hiệu thuận lợi
        </h2>
        {!compact && (
          <p className="mt-1 text-sm text-text-secondary">
            Những tín hiệu hỗ trợ quyết định tuyển sinh.
          </p>
        )}
        {isLoading && !insight ? (
          <Skeleton className="mt-5 h-16 w-full" />
        ) : positives.length ? (
          <ul className="mt-4 divide-y divide-card-border">
            {positives.map((item, index) => (
              <li
                key={index}
                className="break-words py-2 text-sm leading-6 text-text-primary first:pt-0"
              >
                <p title={`${item.refs.length} nguồn dẫn chứng`}>{item.text}</p>
                {!compact && (
                  <p className="mt-1 text-xs text-text-secondary">
                    {item.refs.length} nguồn dẫn chứng
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            Chưa ghi nhận tín hiệu thuận lợi.
          </p>
        )}
      </Card>
      <Card className="min-w-0 p-4">
        <h2 className="text-base font-semibold text-text-primary">
          Thông tin còn thiếu
        </h2>
        {!compact && (
          <p className="mt-1 text-sm text-text-secondary">
            Dữ liệu cần bổ sung để đánh giá rõ hơn.
          </p>
        )}
        {isLoading && !insight ? (
          <Skeleton className="mt-5 h-16 w-full" />
        ) : missing.length ? (
          <ul className="mt-4 divide-y divide-card-border">
            {missing.map((item, index) => (
              <li
                key={index}
                className="break-words py-2 text-sm leading-6 text-text-secondary first:pt-0"
              >
                <span className="font-medium text-text-primary">
                  {item.label}:{" "}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            Chưa ghi nhận thông tin còn thiếu.
          </p>
        )}
      </Card>
    </div>
  );
}
