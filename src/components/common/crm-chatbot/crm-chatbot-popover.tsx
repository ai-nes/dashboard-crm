"use client";

import { ChatIcon, CloseIcon } from "@/components/common/sidebar/icon";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { CRM_CHATBOT_ORIGIN, CRM_CHATBOT_POPOVER_URL } from "./config";
import { useFloatingChatPosition } from "./use-floating-chat-position";
import { useChatbotClose } from "./use-chatbot-close";
import { useStudentFpilotChat } from "./student-fpilot-chat-context";

export default function CrmChatbotPopover() {
  const { isActive: isStudentChatActive } = useStudentFpilotChat();
  const pathname = usePathname();
  const router = useRouter();
  const isFullScreenRoute = pathname === "/crm-chatbot";
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [contextHandle, setContextHandle] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const requestClose = useChatbotClose(
    iframeRef,
    () => setIsOpen(false),
    hasOpened,
  );
  const { containerRef, position, dragging, handleProps } =
    useFloatingChatPosition(!isFullScreenRoute);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (
        event.source !== iframeRef.current?.contentWindow ||
        event.origin !== CRM_CHATBOT_ORIGIN
      ) {
        return;
      }

      const data = event.data;
      if (
        data &&
        typeof data === "object" &&
        (data as { type?: unknown }).type === "crm-chatbot:context-ack"
      ) {
        window.dispatchEvent(
          new CustomEvent("crm-chatbot:context-handoff", {
            detail: { ok: (data as { ok?: unknown }).ok !== false },
          }),
        );
        return;
      }
      if (
        data &&
        typeof data === "object" &&
        (data as { type?: unknown }).type === "crm-chatbot:ready" &&
        contextHandle
      ) {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "crm-chatbot:context-handle", handle: contextHandle },
          CRM_CHATBOT_ORIGIN,
        );
        return;
      }
      if (
        !data ||
        typeof data !== "object" ||
        (data as { type?: unknown }).type !== "crm-chatbot:expand"
      ) {
        return;
      }

      setIsOpen(false);
      router.push("/crm-chatbot");
    };

    const handleContext = (event: Event) => {
      const detail = (event as CustomEvent<{ handle?: unknown }>).detail;
      if (typeof detail?.handle !== "string" || !detail.handle.trim()) return;
      const handle = detail.handle.trim();
      setContextHandle(handle);
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "crm-chatbot:context-handle", handle },
          CRM_CHATBOT_ORIGIN,
        );
      }
    };
    window.addEventListener("message", handleMessage);
    window.addEventListener("crm-chatbot:set-context-handle", handleContext);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(
        "crm-chatbot:set-context-handle",
        handleContext,
      );
    };
  }, [contextHandle, router]);

  const openChatbot = () => {
    setHasOpened(true);
    setIsOpen(true);
  };

  if (isFullScreenRoute) return null;

  return (
    <div
      ref={containerRef}
      style={position}
      aria-hidden={isStudentChatActive || undefined}
      inert={isStudentChatActive}
      className={cn(
        "fixed z-50",
        isStudentChatActive && "pointer-events-none invisible",
        isOpen
          ? "h-[min(700px,calc(100dvh-2rem))] w-[min(420px,calc(100vw-2rem))]"
          : "size-14",
      )}
    >
      {hasOpened ? (
        <div
          aria-hidden={!isOpen}
          data-state={isOpen ? "open" : "closed"}
          className={cn(
            "crm-chatbot-popover-panel absolute right-0 bottom-0 h-[min(700px,calc(100dvh-2rem))] w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-card-border bg-card-surface-area shadow-[0_18px_50px_rgba(31,41,55,0.18)]",
          )}
        >
          <iframe
            ref={iframeRef}
            src={CRM_CHATBOT_POPOVER_URL}
            title="CRM Chatbot"
            allow="microphone"
            tabIndex={isOpen ? 0 : -1}
            className="block size-full border-0 bg-card-background"
          />
          <button
            type="button"
            {...handleProps}
            aria-label="Di chuyển khung chat"
            title="Kéo để di chuyển. Dùng phím mũi tên khi chọn nút này."
            tabIndex={isOpen ? 0 : -1}
            className={cn(
              "absolute top-0 right-[148px] left-14 h-16 touch-none rounded-lg focus-visible:outline-2 focus-visible:outline-primary-500",
              dragging ? "cursor-grabbing" : "cursor-grab",
            )}
          >
            <span className="sr-only">Di chuyển khung chat</span>
          </button>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Đóng CRM Chatbot"
            tabIndex={isOpen ? 0 : -1}
            className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full bg-card-surface-area text-icon-secondary transition-colors hover:bg-background-gray-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <CloseIcon />
          </button>
        </div>
      ) : null}

      {!isOpen ? (
        <button
          type="button"
          onClick={openChatbot}
          {...handleProps}
          aria-label="Mở CRM Chatbot"
          aria-expanded={isOpen}
          title="Mở chatbot hoặc kéo để di chuyển"
          className={cn(
            "crm-chatbot-launcher inline-flex size-14 touch-none items-center justify-center rounded-full bg-primary-500 text-primary-text transition-colors hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
            dragging ? "cursor-grabbing" : "cursor-grab",
          )}
        >
          <span className="flex size-6 [&>svg]:size-full">
            <ChatIcon />
          </span>
        </button>
      ) : null}
    </div>
  );
}
