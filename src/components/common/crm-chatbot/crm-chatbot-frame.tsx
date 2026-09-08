"use client";

import { useEffect, useRef, useState } from "react";
import { CRM_CHATBOT_FULLSCREEN_URL, CRM_CHATBOT_ORIGIN } from "./config";

type CrmChatbotFrameProps = { contextHandle?: string | null };

export default function CrmChatbotFrame({ contextHandle = null }: CrmChatbotFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [handoffState, setHandoffState] = useState<"unavailable" | "pending" | "ready" | "failed">(
    contextHandle ? "pending" : "unavailable",
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== iframeRef.current?.contentWindow || event.origin !== CRM_CHATBOT_ORIGIN) return;
      const data = event.data;
      if (!data || typeof data !== "object" || (data as { type?: unknown }).type !== "crm-chatbot:ready") return;
      if (contextHandle) {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "crm-chatbot:context-handle", handle: contextHandle },
          CRM_CHATBOT_ORIGIN,
        );
        setHandoffState("pending");
      } else {
        setHandoffState("unavailable");
      }
    };
    const handleContext = (event: Event) => {
      const detail = (event as CustomEvent<{ handle?: unknown }>).detail;
      if (typeof detail?.handle !== "string" || !detail.handle.trim()) return;
      iframeRef.current?.contentWindow?.postMessage(
        { type: "crm-chatbot:context-handle", handle: detail.handle.trim() },
        CRM_CHATBOT_ORIGIN,
      );
      setHandoffState("pending");
    };
    const handleAck = (event: MessageEvent<unknown>) => {
      if (event.source !== iframeRef.current?.contentWindow || event.origin !== CRM_CHATBOT_ORIGIN) return;
      const data = event.data as { type?: unknown; ok?: unknown };
      if (data?.type !== "crm-chatbot:context-ack") return;
      setHandoffState(data.ok === false ? "failed" : "ready");
      window.dispatchEvent(new CustomEvent("crm-chatbot:context-handoff", { detail: { ok: data.ok !== false } }));
    };
    window.addEventListener("message", handleMessage);
    window.addEventListener("message", handleAck);
    window.addEventListener("crm-chatbot:set-context-handle", handleContext);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("message", handleAck);
      window.removeEventListener("crm-chatbot:set-context-handle", handleContext);
    };
  }, [contextHandle]);

  return (
    <section className="relative h-full min-h-0 w-full" data-context-handoff={handoffState}>
      <iframe
        ref={iframeRef}
        src={CRM_CHATBOT_FULLSCREEN_URL}
        title="CRM Chatbot"
        loading="lazy"
        allow="microphone"
        className="block size-full border-0 bg-card-background"
      />
    </section>
  );
}
