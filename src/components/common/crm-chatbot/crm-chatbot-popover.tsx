"use client";

import { ChatIcon, CloseIcon } from "@/components/common/sidebar/icon";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { CRM_CHATBOT_ORIGIN, CRM_CHATBOT_POPOVER_URL } from "./config";

export default function CrmChatbotPopover() {
  const pathname = usePathname();
  const router = useRouter();
  const isFullScreenRoute = pathname === "/crm-chatbot";
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        !data ||
        typeof data !== "object" ||
        (data as { type?: unknown }).type !== "crm-chatbot:expand"
      ) {
        return;
      }

      setIsOpen(false);
      router.push("/crm-chatbot");
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  const openChatbot = () => {
    setHasOpened(true);
    setIsOpen(true);
  };

  if (isFullScreenRoute) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50">
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
            scrolling="no"
            tabIndex={isOpen ? 0 : -1}
            className="block size-full border-0 bg-card-background"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
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
          aria-label="Mở CRM Chatbot"
          aria-expanded={isOpen}
          className="crm-chatbot-launcher inline-flex size-14 items-center justify-center rounded-full bg-text-primary text-base-white transition-colors hover:bg-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary"
        >
          <span className="flex size-6 [&>svg]:size-full">
            <ChatIcon />
          </span>
        </button>
      ) : null}
    </div>
  );
}
