"use client";

import { useEffect, useRef, type RefObject } from "react";
import { toast } from "sonner";
import { CRM_CHATBOT_ORIGIN } from "./config";

/** The iframe owns conversation state; the host waits for its close approval. */
export function useChatbotClose(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  onClose: () => void,
  mounted: boolean,
) {
  const ready = useRef(false);
  const pending = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!mounted) {
      ready.current = false;
      pending.current = null;
    }
  }, [mounted]);

  useEffect(() => {
    const handle = (event: MessageEvent<unknown>) => {
      if (
        event.source !== iframeRef.current?.contentWindow ||
        event.origin !== CRM_CHATBOT_ORIGIN
      )
        return;
      const data = event.data as { type?: unknown; requestId?: unknown } | null;
      if (!data || typeof data !== "object") return;
      if (data.type === "crm-chatbot:lifecycle-ready") ready.current = true;
      if (data.requestId !== pending.current || !pending.current) return;
      if (data.type === "crm-chatbot:close-pending") {
        if (timer.current) clearTimeout(timer.current);
      }
      if (data.type === "crm-chatbot:close-approved") {
        pending.current = null;
        if (timer.current) clearTimeout(timer.current);
        onClose();
      }
    };
    window.addEventListener("message", handle);
    return () => {
      window.removeEventListener("message", handle);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [iframeRef, onClose]);

  return () => {
    if (!ready.current || !iframeRef.current?.contentWindow) {
      onClose();
      return;
    }
    const requestId = pending.current ?? crypto.randomUUID();
    pending.current = requestId;
    iframeRef.current.contentWindow.postMessage(
      { type: "crm-chatbot:request-close", requestId },
      CRM_CHATBOT_ORIGIN,
    );
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => toast.error("Chatbot chưa phản hồi. Vui lòng thử đóng lại."),
      3000,
    );
  };
}
