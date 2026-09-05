"use client";

import {
  ThumbsDown2,
  ThumbsUp2,
} from "@tailgrids/icons";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/tailgrids/core/card";
import type { Student360Data } from "@/services/api/students/types";
import { cn } from "@/utils/cn";
import StudentAICardHeader from "./student-ai-card-header";
import StudentGaugeChart from "./student-gauge-chart";

interface StudentSentimentGaugeCardProps {
  data: Student360Data;
  reportSummary?: string | null;
  modelRevision?: string | null;
  policyRevision?: string | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function StudentSentimentGaugeCard({
  data,
  reportSummary,
  modelRevision,
  policyRevision,
  isRefreshing,
  onRefresh,
}: StudentSentimentGaugeCardProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  // Do not invent a score when the API has no potential-score data.
  const scoreCandidate = data.insight.signalScore ?? data.insight.probability;
  const score =
    typeof scoreCandidate === "number" && Number.isFinite(scoreCandidate)
      ? scoreCandidate
      : null;
  const statusText =
    score === null
      ? null
      : score >= 70
        ? "Tiềm năng cao"
        : score >= 40
          ? "Tiềm năng vừa"
          : "Cần chú ý";

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    toast.success(
      type === "up"
        ? "Cảm ơn bạn! Đã ghi nhận phản hồi tích cực về đánh giá điểm tiềm năng."
        : "Cảm ơn bạn! Chúng tôi sẽ tinh chỉnh lại trọng số đánh giá tiềm năng.",
    );
  };

  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Điểm tiềm năng"
        timestamp={
          data.classification.updatedAt
            ? `Cập nhật lúc ${data.classification.updatedAt}${modelRevision ? ` · Model: ${modelRevision.split("/").pop()}` : ""}`
            : policyRevision
              ? `Chính sách: ${policyRevision}`
              : "Được tính toán từ dữ liệu điểm chạm tuyển sinh gần nhất"
        }
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      <div className="mt-4 grid items-center gap-6 lg:grid-cols-[1fr_240px] xl:grid-cols-[1fr_260px]">
        {/* Left column: Narrative analysis, action button, sources & feedback */}
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-text-primary text-pretty">
            {reportSummary ? (
              <>
                {reportSummary}{" "}
                <span className="text-text-secondary">
                  (Điểm tiềm năng: {score === null ? (
                    <span className="font-semibold text-text-primary">
                      Chưa có dữ liệu
                    </span>
                  ) : (
                    <>
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        {score}/100
                      </span>{" "}
                      — {statusText}
                    </>
                  )}).
                </span>
              </>
            ) : score === null ? (
              <>
                Học sinh <span className="font-semibold">{data.student.name}</span>{" "}
                hiện <span className="font-semibold">chưa có dữ liệu</span> điểm tiềm năng. {" "}
                {data.classification.interpretation ||
                  `Học sinh đang quan tâm đến ngành ${data.student.major || "chưa xác định"}.`}{" "}
                {data.insight.recommendation ||
                  "Tư vấn viên nên bổ sung thêm dữ liệu tương tác trước khi đánh giá mức độ ưu tiên chăm sóc."}
              </>
            ) : (
              <>
                Học sinh <span className="font-semibold">{data.student.name}</span> và gia đình được đánh giá ở mức <span className="font-semibold">{statusText}</span>, đạt điểm ưu tiên chăm sóc <span className="font-semibold text-primary-600 dark:text-primary-400">{score}/100</span>.{" "}
                {data.classification.interpretation ||
                  `Học sinh bày tỏ nguyện vọng rõ ràng đối với ngành ${data.student.major} và có nhiều tương tác chủ động.`}{" "}
                {data.insight.recommendation ||
                  `Tư vấn viên nên gửi bảng dự toán học phí và thời hạn xét tuyển học bổng để phụ huynh yên tâm quyết định.`}
              </>
            )}
          </p>

          {/* Feedback thumbs buttons */}
          <div className="flex items-center gap-2 pt-1 text-text-tertiary">
            <button
              type="button"
              onClick={() => handleFeedback("up")}
              aria-label="Hữu ích"
              className={cn(
                "cursor-pointer rounded-sm p-1 transition-colors hover:text-text-primary focus:outline-hidden",
                feedback === "up" && "text-primary-600 dark:text-primary-400",
              )}
            >
              <ThumbsUp2 size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => handleFeedback("down")}
              aria-label="Chưa hữu ích"
              className={cn(
                "cursor-pointer rounded-sm p-1 transition-colors hover:text-text-primary focus:outline-hidden",
                feedback === "down" && "text-error-500",
              )}
            >
              <ThumbsDown2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Right column: Speedometer Gauge Chart */}
        <div className="flex justify-center border-t border-card-border pt-4 lg:border-t-0 lg:pt-0">
          {score === null ? (
            <div
              className="flex min-h-44 items-center justify-center text-sm font-medium text-text-tertiary"
              role="status"
            >
              Chưa có dữ liệu
            </div>
          ) : (
            <StudentGaugeChart
              score={score}
              statusText={statusText ?? undefined}
              label="Điểm tiềm năng"
            />
          )}
        </div>
      </div>
    </Card>
  );
}
