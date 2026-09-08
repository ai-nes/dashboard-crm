"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { getConsultationWorkspace, type ConsultationWorkspace } from "@/services/api/consultation-workspace";
import { issueCopilotContextHandle } from "@/services/api/copilot-context";
import { CRM_CHATBOT_ORIGIN } from "@/components/common/crm-chatbot/config";

export default function StudentConsultationWorkspace({
  recommendationId,
  onClose,
}: {
  recommendationId: string;
  onClose: () => void;
}) {
  const [workspace, setWorkspace] = useState<ConsultationWorkspace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copilotState, setCopilotState] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  useEffect(() => {
    let cancelled = false;
    void getConsultationWorkspace(recommendationId)
      .then((value) => { if (!cancelled) setWorkspace(value); })
      .catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Không thể mở workspace tư vấn."); });
    return () => { cancelled = true; };
  }, [recommendationId]);

  useEffect(() => {
    const handleHandoff = (event: Event) => {
      const detail = (event as CustomEvent<{ ok?: unknown }>).detail;
      setCopilotState(detail?.ok === false ? "failed" : "ready");
    };
    window.addEventListener("crm-chatbot:context-handoff", handleHandoff);
    return () => window.removeEventListener("crm-chatbot:context-handoff", handleHandoff);
  }, []);

  const prepareCopilot = async () => {
    if (!workspace?.subject?.subject_id) return;
    setCopilotState("loading");
    try {
      const handle = await issueCopilotContextHandle(workspace.subject.subject_id, {
        baseUrl: process.env.NEXT_PUBLIC_FRAPPE_URL ?? "",
        origin: CRM_CHATBOT_ORIGIN,
        mode: "consultation",
      });
      window.dispatchEvent(new CustomEvent("crm-chatbot:set-context-handle", { detail: { handle: handle.handle } }));
      window.setTimeout(() => setCopilotState((state) => state === "loading" ? "failed" : state), 5000);
    } catch {
      setCopilotState("failed");
    }
  };

  return (
    <section className="mt-4 rounded-xl border border-primary-200 bg-primary-50/40 p-4" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Consultation workspace</h4>
          <p className="mt-1 text-xs leading-5 text-text-secondary">Brief được đọc lại từ quyết định NBA hiện tại; mọi thay đổi vẫn cần Sales xác nhận.</p>
        </div>
        <Button size="sm" appearance="outline" onPress={onClose}>Đóng</Button>
      </div>
      {!workspace && !error && <p className="mt-3 text-sm text-text-secondary">Đang kiểm tra quyền, hạn và phiên bản dữ liệu…</p>}
      {error && <p className="mt-3 text-sm text-danger-600">{error}</p>}
      {workspace && (
        <div className="mt-4 space-y-3 text-sm">
          <p><span className="font-semibold">Trạng thái:</span> {workspace.status}</p>
          {workspace.goal && <p><span className="font-semibold">Mục tiêu:</span> {workspace.goal}</p>}
          {workspace.verified_facts.length > 0 && <div><p className="font-semibold">Sự kiện đã xác minh</p><ul className="mt-1 list-disc space-y-1 pl-5">{workspace.verified_facts.slice(0, 8).map((fact, index) => <li key={index}>{typeof fact === "string" ? fact : "Thông tin đã được xác minh trong CRM"}</li>)}</ul></div>}
          {workspace.missing_evidence.length > 0 && <p className="text-warning-700">Thiếu dữ liệu: {workspace.missing_evidence.join(", ")}</p>}
          <p className="text-xs text-text-tertiary">Draft follow-up (nếu đủ điều kiện) luôn ở trạng thái review_required và chưa có thao tác gửi tự động.</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button size="sm" appearance="outline" onPress={() => void prepareCopilot()} isDisabled={copilotState === "loading"}>
              {copilotState === "loading" ? "Đang chuẩn bị Copilot…" : "Mở Copilot theo hồ sơ"}
            </Button>
            {copilotState === "ready" && <span className="text-xs text-success-700">Đã gửi context handoff an toàn.</span>}
            {copilotState === "failed" && <span className="text-xs text-warning-700">Không thể bật context handoff; Copilot vẫn ở chế độ thường.</span>}
          </div>
        </div>
      )}
    </section>
  );
}
