"use client";

import {
  Calendar,
  Envelope1,
  FileText,
  Message1,
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
import {
  calls as mockCalls,
  tasks as mockTasks,
  zaloMessages as mockZaloMessages,
} from "./student-tab-data";

interface StudentRecentInteractionsCardProps {
  data: Student360Data;
  reportSummary?: string | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onCreateEmail?: () => void;
}

export default function StudentRecentInteractionsCard({
  data,
  reportSummary,
  isRefreshing,
  onRefresh,
  onCreateEmail,
}: StudentRecentInteractionsCardProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  // Outbound items from API or local fallback data
  const allCalls = data.calls && data.calls.length > 0 ? data.calls : mockCalls;
  const allZalo = data.zaloMessages && data.zaloMessages.length > 0 ? data.zaloMessages : mockZaloMessages;
  const allNotes = data.notes ?? [];
  const allTasks = data.tasks && data.tasks.length > 0 ? data.tasks : mockTasks;

  // Chuẩn hóa dữ liệu Inbound theo nghiệp vụ tuyển sinh Việt Nam (loại bỏ từ dịch thô/dấu gạch kéo dài)
  const inboundSource = useMemo(() => {
    const raw = data.acquisition?.sourceGroup;
    if (!raw) return "Ngày hội tuyển sinh (Open Day)";
    if (raw === "Thực địa") return "Trực tiếp tại trường (Thực địa)";
    return raw;
  }, [data.acquisition?.sourceGroup]);

  const firstTouch = useMemo(() => {
    return (
      data.acquisition?.firstTouch ||
      `Ngày hội trải nghiệm ngành ${data.student.major || "Công nghệ thông tin"}`
    );
  }, [data.acquisition?.firstTouch, data.student.major]);

  const conversion = useMemo(() => {
    const rawApp = data.application?.[0]?.value;
    if (!rawApp || rawApp.toLowerCase() === "draft") {
      return "Phiếu đăng ký tư vấn tuyển sinh";
    }
    return rawApp;
  }, [data.application]);

  const campaign = useMemo(() => {
    const raw = data.acquisition?.campaign;
    if (!raw) return `Tuyển sinh 2027 - ${data.student.major || "Kỹ thuật phần mềm"}`;
    return raw.replace(/[–—]/g, "-");
  }, [data.acquisition?.campaign, data.student.major]);

  const firstConversion = data.acquisition?.capturedAt || "28/08/2026";

  // Danh sách nhật ký tương tác Outbound: Tin nhắn Zalo, Cuộc gọi ra, Ghi chú tư vấn
  const outboundItems = useMemo(() => {
    const list = [
      ...allZalo
        .filter((m) => m.direction === "outbound")
        .map((m) => ({
          id: m.id,
          channel: "zalo" as const,
          channelLabel: "Tin nhắn Zalo",
          assignee: m.senderName,
          recipient: m.recipientName,
          time: m.time,
          content: m.content,
        })),
      ...allCalls
        .filter((c) => c.direction === "outbound")
        .map((c) => ({
          id: c.id,
          channel: "call" as const,
          channelLabel: "Cuộc gọi ra",
          assignee: c.callerName,
          recipient: c.receiverName || "Phụ huynh học sinh",
          time: c.time,
          content: c.summary || c.topic || "Đã liên hệ tư vấn chuyên môn.",
        })),
      ...allNotes.map((n, idx) => ({
        id: `note-${idx}`,
        channel: "note" as const,
        channelLabel: "Ghi chú tư vấn",
        assignee: n.author,
        recipient: null,
        time: n.date,
        content: n.content,
      })),
      ...allTasks.map((t) => ({
        id: t.id,
        channel: "task" as const,
        channelLabel: "Nhiệm vụ theo dõi",
        assignee: t.assignee,
        recipient: null,
        time: t.dueDate ? `Hạn: ${t.dueDate}` : "Trong tuần này",
        content: t.title + (t.notes ? `: ${t.notes}` : ""),
      })),
    ];

    return list.slice(0, 5);
  }, [allZalo, allCalls, allNotes, allTasks]);

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    toast.success(
      type === "up"
        ? "Đã ghi nhận phản hồi tích cực."
        : "Đã ghi nhận góp ý để tinh chỉnh đề xuất.",
    );
  };

  const handleEmailAction = () => {
    if (onCreateEmail) {
      onCreateEmail();
    } else {
      toast.success(
        `Đã tạo thư tư vấn gửi đến ${data.student.name} (${data.student.email})`,
      );
    }
  };

  // Xác định tên phụ huynh tự nhiên, tránh hoàn toàn chữ "(null)"
  const parentDisplayName =
    data.parentProfile?.name &&
    data.parentProfile.name !== "null" &&
    data.parentProfile.name.trim() !== ""
      ? `phụ huynh (${data.parentProfile.name})`
      : "phụ huynh học sinh";

  return (
    <Card className="min-w-0 overflow-hidden border border-card-border p-5 lg:p-6">
      <StudentAICardHeader
        title="Nhật ký tương tác gần đây"
        timestamp={
          data.classification.updatedAt
            ? `Cập nhật lúc ${data.classification.updatedAt}`
            : "Tổng hợp từ dữ liệu trao đổi trong 30 ngày qua"
        }
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />

      {/* Narrative summary & Email action */}
      <div className="mt-3.5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="flex-1 text-sm leading-relaxed text-text-primary text-pretty">
          {reportSummary ? (
            <>
              <span className="font-semibold text-text-primary">Đánh giá hành trình:</span> {reportSummary}
            </>
          ) : (
            <>
              Hồ sơ của <span className="font-semibold text-text-primary">{data.student.name}</span> duy trì tương tác tốt với {allCalls.length} cuộc gọi và {allNotes.length} ghi chú theo dõi. Cán bộ tuyển sinh nên chủ động kết nối với {parentDisplayName} qua {data.parentProfile?.preferredChannel || "điện thoại"} vào khung giờ {data.parentProfile?.bestContactTime || "phù hợp"} để giải đáp thắc mắc về học phí và hướng dẫn hoàn thiện hồ sơ.
            </>
          )}
        </p>
        <div className="shrink-0">
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
      </div>

      {/* Two columns: Inbound & Outbound (Thiết kế phẳng, không lồng card con) */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Column 1: Inbound (Thông số tiếp cận & chuyển đổi) */}
        <div className="flex flex-col rounded-xl border border-card-border/70 bg-background-soft-50/50 p-4 sm:p-5 dark:bg-card-background/40">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">
              Kênh tiếp cận tuyển sinh (Inbound)
            </h4>
            <span className="text-xs font-medium text-text-tertiary">
              Nguồn chuyển đổi
            </span>
          </div>

          {/* Danh sách thông tin tiếp cận trình bày phẳng, rõ ràng, đúng chuẩn tuyển sinh */}
          <dl className="mt-3 divide-y divide-card-border/40 text-xs">
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="font-medium text-text-secondary">Nguồn tiếp cận:</dt>
              <dd className="font-semibold text-text-primary text-right">{inboundSource}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="font-medium text-text-secondary">Điểm chạm đầu tiên:</dt>
              <dd className="font-medium text-text-primary text-right">{firstTouch}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="font-medium text-text-secondary">Hình thức đăng ký:</dt>
              <dd className="font-medium text-text-primary text-right">{conversion}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="font-medium text-text-secondary">Chiến dịch tuyển sinh:</dt>
              <dd className="font-medium text-text-primary text-right">{campaign}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 py-2.5">
              <dt className="font-medium text-text-secondary">Thời gian tiếp cận đầu tiên:</dt>
              <dd className="font-medium text-text-primary text-right">{firstConversion}</dd>
            </div>
          </dl>
        </div>

        {/* Column 2: Outbound (Nhật ký chăm sóc của tư vấn viên dạng Activity Feed phẳng) */}
        <div className="flex flex-col rounded-xl border border-card-border/70 bg-background-soft-50/50 p-4 sm:p-5 dark:bg-card-background/40">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
            <h4 className="text-sm font-semibold text-text-primary">
              Nhật ký chăm sóc (Outbound)
            </h4>
            <span className="text-xs font-medium text-text-tertiary">
              {outboundItems.length} hoạt động
            </span>
          </div>

          {/* Danh sách hoạt động Outbound dạng Feed thanh lịch, không bọc card con */}
          <div className="mt-3 divide-y divide-card-border/40 text-xs">
            {outboundItems.map((item) => (
              <div key={item.id} className="py-2.5 first:pt-1 last:pb-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {item.channel === "zalo" && (
                      <Message1 size={14} className="shrink-0 text-primary-500" aria-hidden="true" />
                    )}
                    {item.channel === "call" && (
                      <Phone size={14} className="shrink-0 text-success-500" aria-hidden="true" />
                    )}
                    {item.channel === "note" && (
                      <FileText size={14} className="shrink-0 text-warning-500" aria-hidden="true" />
                    )}
                    {item.channel === "task" && (
                      <Calendar size={14} className="shrink-0 text-text-tertiary" aria-hidden="true" />
                    )}
                    <span className="font-semibold text-text-primary truncate">
                      {item.channelLabel}
                    </span>
                    <span className="text-[11px] text-text-tertiary truncate">
                      bởi {item.assignee}
                    </span>
                  </div>
                  <time className="shrink-0 text-[11px] text-text-tertiary">
                    {item.time}
                  </time>
                </div>

                <p className="mt-1 pl-5 text-text-secondary leading-relaxed line-clamp-2">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback buttons */}
      <div className="mt-4 flex items-center gap-2 pt-2 text-text-tertiary">
        <button
          type="button"
          onClick={() => handleFeedback("up")}
          aria-label="Hữu ích"
          className={cn(
            "cursor-pointer rounded-sm p-1 transition-colors hover:text-text-primary focus:outline-hidden",
            feedback === "up" && "text-primary-500",
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
    </Card>
  );
}
