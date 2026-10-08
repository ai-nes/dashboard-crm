"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/tailgrids/core/button";
import {
  useNbaCardDecision,
  useStudentMemory,
  useStudentMemoryActions,
} from "@/hooks/use-student-ai";
import type {
  AiMemoryItem,
  StudentAiOverview,
} from "@/services/api/student-ai";

interface StudentAiPanelProps {
  studentId: string;
  overview: StudentAiOverview | undefined;
  isActive: boolean;
  onAnalyze: () => void;
}

const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" });
const formatDate = (value: string | null) =>
  value ? dateFormat.format(new Date(value)) : null;

function AiRecommendations({
  studentId,
  overview,
}: {
  studentId: string;
  overview: StudentAiOverview;
}) {
  const { analysis, labels } = overview;
  const { accept, reject } = useNbaCardDecision(studentId);
  const busy = accept.isPending || reject.isPending;
  const fail = () =>
    toast.error("Chưa thể ghi nhận quyết định", {
      description: "Đề xuất có thể đã được xử lý, vui lòng tải lại.",
    });
  if (!analysis) {
    return (
      <p className="text-sm text-text-tertiary">
        Chưa có phân tích. Chọn “Phân tích” để AI đề xuất bước tiếp theo.
      </p>
    );
  }
  if (analysis.nba.items.length === 0) {
    return (
      <p className="text-sm text-text-tertiary">
        {analysis.nba.disposition === "NO_ACTION"
          ? "AI không đề xuất hành động nào lúc này."
          : "Chưa có đề xuất."}
      </p>
    );
  }
  return (
    <ol className="space-y-3">
      {analysis.nba.items.map((item) => (
        <li
          key={`${item.rank}-${item.action_code}`}
          className="rounded-lg border border-border-secondary p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">
              {item.rank}. {item.title}
            </span>
            <span className="rounded-full bg-fill-secondary px-2 py-0.5 text-xs text-text-secondary">
              {labels.actions[item.action_code] ?? item.action_code}
            </span>
          </div>
          <p className="mt-2 text-sm text-text-secondary">{item.goal}</p>
          <p className="mt-1 text-sm text-text-tertiary">{item.why}</p>
          {item.time && (
            <p className="mt-1 text-xs text-text-tertiary">
              Thời điểm: {item.time}
            </p>
          )}
          {item.card_id && item.status === "pending" && (
            <div className="mt-3 flex gap-2">
              <Button
                size="xs"
                isDisabled={busy}
                onPress={() =>
                  accept.mutate(
                    { cardId: item.card_id! },
                    {
                      onSuccess: () =>
                        toast.success("Đã tạo việc từ đề xuất"),
                      onError: fail,
                    },
                  )
                }
              >
                Duyệt và tạo việc
              </Button>
              <Button
                appearance="outline"
                size="xs"
                isDisabled={busy}
                onPress={() =>
                  reject.mutate({ cardId: item.card_id! }, { onError: fail })
                }
              >
                Từ chối
              </Button>
            </div>
          )}
          {item.status === "accepted" && (
            <p className="mt-3 text-xs font-medium text-text-success">
              Đã duyệt, việc đã được tạo
              {item.task_status === "Done" ? " và hoàn thành." : "."}
            </p>
          )}
          {item.status === "rejected" && (
            <p className="mt-3 text-xs text-text-tertiary">Đã từ chối.</p>
          )}
        </li>
      ))}
    </ol>
  );
}

function MemoryRow({
  studentId,
  item,
  typeLabel,
}: {
  studentId: string;
  item: AiMemoryItem;
  typeLabel: string;
}) {
  const { edit, close } = useStudentMemoryActions(studentId);
  const [draft, setDraft] = useState<string | null>(null);
  const busy = edit.isPending || close.isPending;
  const fail = () =>
    toast.error("Chưa thể cập nhật trí nhớ", {
      description: "Dữ liệu có thể đã thay đổi, vui lòng thử lại.",
    });

  const save = () => {
    const text = draft?.trim();
    if (!text || text === item.text) {
      setDraft(null);
      return;
    }
    edit.mutate({ item, text }, { onSuccess: () => setDraft(null), onError: fail });
  };

  return (
    <li className="rounded-lg border border-border-secondary p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
        <span>{typeLabel}</span>
        {item.due && <span>· hạn {formatDate(item.due)}</span>}
        <span>· {item.source === "sale" ? "sale ghi" : "AI ghi"}</span>
      </div>
      {draft === null ? (
        <p className="mt-1 text-sm text-text-primary">{item.text}</p>
      ) : (
        <textarea
          aria-label="Nội dung trí nhớ"
          className="mt-1 w-full rounded-md border border-border-secondary p-2 text-sm"
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {draft === null ? (
          <Button
            appearance="outline"
            size="xs"
            isDisabled={busy}
            onPress={() => setDraft(item.text)}
          >
            Sửa
          </Button>
        ) : (
          <>
            <Button size="xs" isDisabled={busy} onPress={save}>
              Lưu
            </Button>
            <Button
              appearance="outline"
              size="xs"
              isDisabled={busy}
              onPress={() => setDraft(null)}
            >
              Hủy
            </Button>
          </>
        )}
        <Button
          appearance="outline"
          size="xs"
          isDisabled={busy}
          onPress={() => close.mutate({ item, status: "done" }, { onError: fail })}
        >
          Đã xong
        </Button>
        <Button
          appearance="outline"
          size="xs"
          isDisabled={busy}
          onPress={() =>
            close.mutate({ item, status: "contradicted" }, { onError: fail })
          }
        >
          Không còn đúng
        </Button>
      </div>
    </li>
  );
}

function AiMemory({
  studentId,
  overview,
}: {
  studentId: string;
  overview: StudentAiOverview | undefined;
}) {
  const memory = useStudentMemory(studentId);
  const items = (memory.data ?? []).filter((item) => item.status === "open");
  if (items.length === 0) {
    return (
      <p className="text-sm text-text-tertiary">
        Chưa có điều gì cần nhớ. Ghi chú về học sinh sẽ được AI tóm tắt ở đây.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <MemoryRow
          key={item.id}
          studentId={studentId}
          item={item}
          typeLabel={overview?.labels.memory_types[item.type] ?? item.type}
        />
      ))}
    </ul>
  );
}

export default function StudentAiPanel({
  studentId,
  overview,
  isActive,
  onAnalyze,
}: StudentAiPanelProps) {
  const generatedAt = overview?.analysis
    ? formatDate(overview.analysis.generated_at)
    : null;
  return (
    <div className="space-y-6">
      <section aria-labelledby="ai-nba-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="ai-nba-heading"
              className="text-base font-semibold tracking-tight"
            >
              Hành động tiếp theo
            </h2>
            <p className="text-xs text-text-tertiary" aria-live="polite">
              {isActive
                ? "Đang cập nhật phân tích…"
                : overview?.state === "failed"
                  ? "Lần phân tích gần nhất chưa hoàn tất."
                  : overview?.stale
                    ? "Có dữ liệu mới sau lần phân tích gần nhất."
                    : generatedAt
                      ? `Phân tích ngày ${generatedAt}`
                      : null}
            </p>
          </div>
          {overview?.enabled !== false && (
            <Button
              appearance="outline"
              size="xs"
              isDisabled={isActive}
              onPress={onAnalyze}
            >
              {isActive ? "Đang phân tích" : "Phân tích"}
            </Button>
          )}
        </div>
        {overview?.enabled === false ? (
          <p className="text-sm text-text-tertiary">
            Tính năng AI chưa được bật trên hệ thống.
          </p>
        ) : overview ? (
          <AiRecommendations studentId={studentId} overview={overview} />
        ) : null}
      </section>

      <section aria-labelledby="ai-memory-heading" className="space-y-3">
        <h2
          id="ai-memory-heading"
          className="text-base font-semibold tracking-tight"
        >
          Trí nhớ
        </h2>
        <AiMemory studentId={studentId} overview={overview} />
      </section>
    </div>
  );
}
