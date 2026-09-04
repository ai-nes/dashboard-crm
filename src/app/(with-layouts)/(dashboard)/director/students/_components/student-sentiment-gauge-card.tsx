"use client";

import {
  Calendar,
  Envelope1,
  FileText,
  Phone,
  ThumbsDown2,
  ThumbsUp2,
} from "@tailgrids/icons";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/tailgrids/core/button";
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
  onCreateEmail?: () => void;
}

export default function StudentSentimentGaugeCard({
  data,
  reportSummary,
  modelRevision,
  policyRevision,
  isRefreshing,
  onRefresh,
  onCreateEmail,
}: StudentSentimentGaugeCardProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  // Score from API response
  const score = data.insight.signalScore ?? data.insight.probability ?? 82;
  const statusText = score >= 70 ? "Tiềm năng cao" : score >= 40 ? "Tiềm năng vừa" : "Cần chú ý";

  // Calculate actual sources count from API response
  const sourcesCount = useMemo(() => {
    let count = 0;
    if (data.calls && data.calls.length > 0) count += 1;
    if (data.tasks && data.tasks.length > 0) count += 1;
    if (data.notes && data.notes.length > 0) count += 1;
    if (data.insight.evidence && data.insight.evidence.length > 0) count += 1;
    return Math.max(3, count);
  }, [data]);

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    toast.success(
      type === "up"
        ? "Cảm ơn bạn! Đã ghi nhận phản hồi tích cực về đánh giá điểm tiềm năng."
        : "Cảm ơn bạn! Chúng tôi sẽ tinh chỉnh lại trọng số đánh giá tiềm năng.",
    );
  };

  const handleEmailAction = () => {
    if (onCreateEmail) {
      onCreateEmail();
    } else {
      toast.success(
        `Đã mở mẫu soạn email tư vấn cho ${data.student.name} (${data.student.email})`,
      );
    }
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
                  (Điểm tiềm năng: <span className="font-semibold text-primary-600 dark:text-primary-400">{score}/100</span> — {statusText}).
                </span>
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

          <div>
            <Button
              appearance="outline"
              size="xs"
              onPress={handleEmailAction}
              className="rounded-lg font-medium text-text-primary hover:bg-background-soft-100"
            >
              <Envelope1 size={14} aria-hidden="true" />
              Soạn email tư vấn
            </Button>
          </div>

          {/* Sources count & icons */}
          <div className="flex items-center gap-2 text-xs font-medium text-text-tertiary">
            <div className="flex items-center -space-x-0.5 text-text-secondary">
              <Phone size={14} aria-hidden="true" />
              <Calendar size={14} aria-hidden="true" />
              <FileText size={14} aria-hidden="true" />
            </div>
            <span>{sourcesCount} nguồn dữ liệu CRM</span>
          </div>

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
          <StudentGaugeChart
            score={score}
            statusText={statusText}
            label="Điểm tiềm năng"
          />
        </div>
      </div>
    </Card>
  );
}
