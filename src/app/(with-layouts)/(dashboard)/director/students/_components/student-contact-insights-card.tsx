"use client";

import { ChevronDown, ChevronUp, Sparkle } from "@tailgrids/icons";
import { useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import type { AnalysisClaim } from "@/services/api/analysis-runs";
import type { Student360Data } from "@/services/api/students/types";
import StudentAICardHeader from "./student-ai-card-header";
import { tasks as mockTasks } from "./student-tab-data";

interface StudentContactInsightsCardProps {
  data: Student360Data;
  nbaRecommendations?: AnalysisClaim[];
  reportTitle?: string | null;
  policyRevision?: string | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onOpenAskAI?: () => void;
}

export default function StudentContactInsightsCard({
  data,
  nbaRecommendations = [],
  reportTitle,
  policyRevision,
  isRefreshing,
  onRefresh,
  onOpenAskAI,
}: StudentContactInsightsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract real call info from response
  const allCalls = data.calls ?? [];
  const latestCall = allCalls.find((c) => c.outcome === "connected") || allCalls[0];
  const recentCallContact = latestCall?.receiverName || latestCall?.callerName || data.student.name;
  const recentCallDate = latestCall?.time || "03/09/2026";
  const recentCallTopic = latestCall?.summary || latestCall?.topic || `tư vấn ngành ${data.student.major}`;

  // Extract pending tasks from response or fallback data
  const allTasks = (data.tasks && data.tasks.length > 0) ? data.tasks : mockTasks;
  const pendingTasks = allTasks.filter((t) => t.status !== "done");
  const primaryTask = pendingTasks.length > 0 ? pendingTasks[0] : allTasks[0];
  const taskTitle = primaryTask?.title || `Trao đổi với phụ huynh ${data.student.name}`;
  const taskDetail = primaryTask?.notes || `liên hệ theo dõi thông tin tuyển sinh ngành ${data.student.major}`;

  // Priority NBA action from intelligence runs stage 2 (next_best_action)
  const topNbaAction = nbaRecommendations[0]?.statement;
  const suggestedAction =
    topNbaAction ||
    data.insight.recommendation ||
    data.classification.action ||
    "Xem xét cập nhật kết quả trao đổi và cam kết các bước theo dõi tiếp theo.";

  // Dynamic timestamp
  const timestamp = data.classification.updatedAt
    ? `Cập nhật lúc ${data.classification.updatedAt}${policyRevision ? ` (Chính sách: ${policyRevision})` : ""}`
    : "Được tạo hôm nay bởi AI-NES";

  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Tín hiệu tư vấn tuyển sinh"
        timestamp={timestamp}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      {/* Focus title from Analysis Run report */}
      {reportTitle && (
        <div className="mt-3 rounded-lg border border-card-border/70 bg-background-soft-50/70 p-3 text-xs leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">Đánh giá trọng tâm:</span> {reportTitle}
        </div>
      )}

      {/* Inner insights container */}
      <div className="mt-4 rounded-xl border border-card-border bg-background-soft-50/50 p-4 sm:p-5">
        <ul className="space-y-3.5 text-sm leading-relaxed text-text-primary">
          {/* Bullet 1: Recent call */}
          <li className="list-disc pl-1 ml-4">
            <span className="font-semibold text-text-primary">Cuộc gọi gần nhất:</span>{" "}
            Đã hoàn thành trao đổi với {recentCallContact} vào {recentCallDate} (chủ đề: {recentCallTopic}).
            <div className="mt-1 text-xs text-text-secondary pl-2">
              <span className="font-medium text-text-primary">Hành động đề xuất (NBA):</span> {suggestedAction}
            </div>
          </li>

          {/* Bullet 2: Follow-up task */}
          <li className="list-disc pl-1 ml-4">
            <span className="font-semibold text-text-primary">Nhiệm vụ cần theo dõi:</span>{" "}
            &ldquo;{taskTitle}&rdquo; {primaryTask?.status === "todo" ? "chưa bắt đầu" : "đang xử lý"}
            {primaryTask?.dueDate ? ` (Hạn: ${primaryTask.dueDate}${primaryTask.dueTime ? ` lúc ${primaryTask.dueTime}` : ""})` : ""}, {" "}
            nội dung: {taskDetail}.
          </li>

          {/* Expanded extra insights from API response */}
          {isExpanded && (
            <>
              {/* NBA sequence if multiple claims exist */}
              {nbaRecommendations.length > 1 && (
                <li className="list-disc pl-1 ml-4">
                  <span className="font-semibold text-text-primary">Thứ tự ưu tiên hành động tiếp theo (NBA):</span>
                  <ol className="mt-1.5 space-y-1.5 list-decimal pl-4 text-xs text-text-secondary">
                    {nbaRecommendations.map((nba, idx) => (
                      <li key={idx}>
                        <span className="font-medium text-text-primary">{nba.statement}</span>
                        {nba.provenanceIds && nba.provenanceIds.length > 0 && (
                          <span className="ml-1.5 text-[11px] text-text-tertiary">
                            (Nguồn: {nba.provenanceIds.join(", ")})
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </li>
              )}

              <li className="list-disc pl-1 ml-4">
                <span className="font-semibold text-text-primary">Phân loại tuyển sinh:</span>{" "}
                {data.classification?.combination || "Quan tâm cao, Phù hợp cao"}.{" "}
                {data.classification?.interpretation || "Hồ sơ có triển vọng tốt."}
              </li>
              {data.parentProfile && (
                <li className="list-disc pl-1 ml-4">
                  <span className="font-semibold text-text-primary">Đại diện phụ huynh:</span>{" "}
                  {data.parentProfile.name} ({data.parentProfile.relation}, {data.parentProfile.role}). Mối quan tâm chính:{" "}
                  {(data.parentProfile.concerns || []).join(", ") || data.insight?.concern || "Học phí và học bổng"}. Kênh ưu tiên:{" "}
                  {data.parentProfile.preferredChannel || "Điện thoại"} ({data.parentProfile.bestContactTime || "trong giờ hành chính"}).
                </li>
              )}
              {data.readiness && data.readiness.length > 0 && (
                <li className="list-disc pl-1 ml-4">
                  <span className="font-semibold text-text-primary">Chỉ số sẵn sàng nhập học:</span>{" "}
                  {data.readiness.map((r) => `${r.label}: ${r.value}/100`).join(", ")}
                </li>
              )}
            </>
          )}
        </ul>

        {/* Toggle see more / see less */}
        <div className="mt-3.5 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary focus:outline-hidden"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} aria-hidden="true" />
                <span>Thu gọn</span>
              </>
            ) : (
              <>
                <ChevronDown size={14} aria-hidden="true" />
                <span>Xem thêm chi tiết</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-4">
        <Button
          appearance="outline"
          size="xs"
          onPress={onOpenAskAI}
          className="rounded-full font-medium"
        >
          <Sparkle size={13} aria-hidden="true" />
          <span>Đặt câu hỏi cho AI</span>
        </Button>
      </div>
    </Card>
  );
}
