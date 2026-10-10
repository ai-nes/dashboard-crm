"use client";

import { CRM_CHATBOT_FULLSCREEN_URL, CRM_CHATBOT_ORIGIN } from "@/components/common/crm-chatbot/config";
import type { Student360Data } from "@/services/api/students/types";
import { useEffect, useMemo, useRef } from "react";

interface StudentAskAIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: Student360Data;
  canReadStudent: boolean;
}

export default function StudentAskAIDialog({
  isOpen,
  onClose,
  data,
  canReadStudent,
}: StudentAskAIDialogProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const studentId = data.student.studentId?.trim();
  const src = useMemo(() => {
    if (!studentId) return "";
    const url = new URL(CRM_CHATBOT_FULLSCREEN_URL);
    url.searchParams.set("studentId", studentId);
    return url.toString();
  }, [studentId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== iframeRef.current?.contentWindow || event.origin !== CRM_CHATBOT_ORIGIN) return;
      const message = event.data as { type?: unknown } | null;
      if (message?.type === "crm-chatbot:expand") {
        const url = new URL(src);
        url.searchParams.delete("mode");
        window.open(url.toString(), "_blank", "noopener,noreferrer");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isOpen, src]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="ask-ai-title" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <button type="button" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} aria-label="Đóng hộp thoại" />
      <section className="relative flex h-[min(850px,calc(100dvh-1.5rem))] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-card-border bg-card-background shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-card-border px-5 py-3">
          <h2 id="ask-ai-title" className="text-base font-semibold text-text-primary">Hỏi AI về {data.student.name}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-lg px-3 py-1.5 text-sm text-text-secondary hover:bg-background-soft-100">Đóng</button>
        </header>
        {canReadStudent && studentId ? (
          <iframe
            key={studentId}
            ref={iframeRef}
            src={src}
            title={`Chatbot về ${data.student.name}`}
            allow="microphone"
            className="min-h-0 flex-1 border-0 bg-card-background"
          />
        ) : (
          <div role="alert" className="p-6 text-sm text-text-secondary">
            {!canReadStudent ? "Bạn không có quyền xem hồ sơ học sinh này." : "Hồ sơ chưa có studentId hợp lệ để mở cuộc trò chuyện."}
          </div>
        )}
      </section>
    </div>
  );
}
