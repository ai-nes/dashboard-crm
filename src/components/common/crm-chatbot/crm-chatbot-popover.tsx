"use client";

import { ChatIcon, CloseIcon } from "@/components/common/sidebar/icon";
import { Minus } from "@tailgrids/icons";
import { cn } from "@/utils/cn";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  CRM_CHATBOT_ORIGIN,
  CRM_CHATBOT_POPOVER_URL,
} from "./config";
import { useChatbotClose } from "./use-chatbot-close";
import { useFloatingChatPosition } from "./use-floating-chat-position";
import { useStudentFpilotChat } from "./student-fpilot-chat-context";

const controlClassName =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-background-soft-100 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

function makeOutsideInert(dialog: HTMLElement) {
  const changed: Array<{ element: HTMLElement; wasInert: boolean }> = [];
  let current: HTMLElement | null = dialog;

  while (current && current !== document.body) {
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) break;
    for (const sibling of Array.from(parent.children)) {
      if (
        !(sibling instanceof HTMLElement) ||
        sibling === current ||
        sibling.hasAttribute("data-modal-backdrop")
      )
        continue;
      changed.push({ element: sibling, wasInert: sibling.inert });
      sibling.inert = true;
    }
    current = parent;
  }

  return () => {
    for (const item of changed.reverse()) item.element.inert = item.wasInert;
  };
}

export default function CrmChatbotPopover() {
  const {
    mode,
    session,
    isActive,
    hasOpened,
    openGeneralChat,
    minimizeStudentChat,
    expandStudentChat,
    closeChat,
    closeApprovedStudentChat,
  } = useStudentFpilotChat();
  const pathname = usePathname();
  const isFullScreenRoute = pathname === "/crm-chatbot";
  const isExpanded = mode === "expanded";
  const [frameReady, setFrameReady] = useState(false);
  const [contextHandle, setContextHandle] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const minimizeButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousModeRef = useRef(mode);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const restoreOutsideRef = useRef<(() => void) | null>(null);
  const { containerRef, position, dragging, handleProps } =
    useFloatingChatPosition(!isFullScreenRoute && mode !== "expanded");

  const approveClose = useCallback(() => {
    if (session) closeApprovedStudentChat(session.opening);
    else closeChat();
  }, [closeApprovedStudentChat, closeChat, session]);
  const requestChatClose = useChatbotClose(iframeRef, approveClose, hasOpened);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (
        event.source !== iframeRef.current?.contentWindow ||
        event.origin !== CRM_CHATBOT_ORIGIN
      )
        return;

      const data = event.data as {
        type?: unknown;
        direction?: unknown;
        handle?: unknown;
        ok?: unknown;
        requestId?: unknown;
      } | null;

      if (data?.type === "crm-chatbot:ready") {
        setFrameReady(true);
        if (contextHandle) {
          iframeRef.current?.contentWindow?.postMessage(
            { type: "crm-chatbot:context-handle", handle: contextHandle },
            CRM_CHATBOT_ORIGIN,
          );
        }
        return;
      }
      if (data?.type === "crm-chatbot:student-scope-ready") {
        setFrameReady(true);
        return;
      }
      if (data?.type === "crm-chatbot:context-ack") {
        window.dispatchEvent(
          new CustomEvent("crm-chatbot:context-handoff", {
            detail: { ok: data.ok !== false },
          }),
        );
        return;
      }
      if (data?.type === "crm-chatbot:student-scope-ack" && data.ok === false) {
        toast.error("Không thể chuyển ngữ cảnh Fpilot sang hồ sơ học sinh này.");
        return;
      }
      if (data?.type === "crm-chatbot:host-tab-boundary" && isExpanded) {
        if (data.direction === "forward") minimizeButtonRef.current?.focus();
        else if (data.direction === "backward") closeButtonRef.current?.focus();
        return;
      }
      if (data?.type === "crm-chatbot:host-close-request" && isExpanded) {
        requestChatClose();
        return;
      }
      if (data?.type === "crm-chatbot:expand") {
        expandStudentChat();
        return;
      }
      if (data?.type === "crm-chatbot:minimize") minimizeStudentChat();
    };

    const handleContext = (event: Event) => {
      const detail = (event as CustomEvent<{ handle?: unknown }>).detail;
      if (typeof detail?.handle !== "string" || !detail.handle.trim()) return;
      const handle = detail.handle.trim();
      setContextHandle(handle);
      iframeRef.current?.contentWindow?.postMessage(
        { type: "crm-chatbot:context-handle", handle },
        CRM_CHATBOT_ORIGIN,
      );
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("crm-chatbot:set-context-handle", handleContext);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("crm-chatbot:set-context-handle", handleContext);
    };
  }, [contextHandle, expandStudentChat, isExpanded, minimizeStudentChat, requestChatClose]);

  useEffect(() => {
    if (!frameReady || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: "crm-chatbot:student-fpilot-mode",
        mode: isExpanded ? "expanded" : "compact",
      },
      CRM_CHATBOT_ORIGIN,
    );
  }, [frameReady, isExpanded, mode]);

  useEffect(() => {
    if (!frameReady || !session || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: "crm-chatbot:set-student-scope",
        studentId: session.studentId,
        studentName: session.studentName,
        requestId: session.opening,
      },
      CRM_CHATBOT_ORIGIN,
    );
  }, [frameReady, session]);

  useLayoutEffect(() => {
    const previousMode = previousModeRef.current;
    const dialog = dialogRef.current;

    if (isExpanded && dialog) {
      if (previousMode !== "expanded") {
        const active = document.activeElement;
        returnFocusRef.current =
          active instanceof HTMLElement && active !== document.body
            ? active
            : document.querySelector<HTMLElement>("[data-student-fpilot-trigger]");
      }
      restoreOutsideRef.current?.();
      restoreOutsideRef.current = makeOutsideInert(dialog);
      dialog.focus();
    } else if (previousMode === "expanded" && mode === "compact") {
      restoreOutsideRef.current?.();
      restoreOutsideRef.current = null;
      requestAnimationFrame(() => iframeRef.current?.focus());
    } else if (previousMode !== "closed" && mode === "closed") {
      restoreOutsideRef.current?.();
      restoreOutsideRef.current = null;
      requestAnimationFrame(() => {
        const target = returnFocusRef.current;
        if (target?.isConnected && !target.closest("[inert]")) target.focus();
        else
          document
            .querySelector<HTMLElement>(
              '[data-student-fpilot-trigger], [data-student-fpilot-launcher]',
            )
            ?.focus();
        returnFocusRef.current = null;
      });
    }

    previousModeRef.current = mode;
  }, [isExpanded, mode]);

  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (event.defaultPrevented) return;
        event.preventDefault();
        requestChatClose();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null && !element.inert);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (
        event.shiftKey &&
        (active === first || active === dialog || !dialog.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || active === dialog || !dialog.contains(active))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, requestChatClose]);

  useEffect(
    () => () => {
      restoreOutsideRef.current?.();
      restoreOutsideRef.current = null;
    },
    [],
  );

  const openChatbot = () => {
    openGeneralChat();
  };

  if (isFullScreenRoute) return null;

  return (
    <div
      ref={containerRef}
      style={isExpanded ? undefined : position}
      aria-label={isExpanded ? "Fpilot" : undefined}
      className={cn(
        "fixed z-[70]",
        isExpanded
          ? "inset-0 flex items-center justify-center p-3 sm:p-6"
          : mode === "compact"
            ? "h-[min(700px,calc(100dvh-2rem))] w-[min(420px,calc(100vw-2rem))]"
            : mode === "closed"
              ? "size-14"
              : "pointer-events-none size-0 overflow-hidden",
      )}
    >
      {isExpanded ? (
        <button
          type="button"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          onClick={requestChatClose}
          data-modal-backdrop
          tabIndex={-1}
          aria-hidden="true"
          aria-label="Đóng hộp thoại Fpilot"
        />
      ) : null}

      {hasOpened || isActive ? (
        <section
          ref={dialogRef}
          role={isExpanded ? "dialog" : undefined}
          aria-modal={isExpanded}
          aria-labelledby={isExpanded ? "crm-fpilot-title" : undefined}
          aria-hidden={!isActive}
          inert={!isActive}
          tabIndex={isExpanded ? -1 : undefined}
          data-state={mode}
          className={cn(
            "crm-chatbot-popover-panel flex min-h-0 flex-col overflow-hidden border border-card-border bg-card-surface-area shadow-[0_18px_50px_rgba(31,41,55,0.18)]",
            isExpanded
              ? "relative h-[min(850px,calc(100dvh-1.5rem))] w-full max-w-6xl rounded-2xl"
              : mode === "compact"
                ? "absolute right-0 bottom-0 h-full w-full rounded-2xl"
                : "pointer-events-none size-px rounded-2xl opacity-0",
          )}
        >
          {isExpanded ? (
            <header className="relative flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-card-border px-3 py-2 sm:px-5">
              <h2
                id="crm-fpilot-title"
                className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary sm:text-base"
              >
                {session ? `Hỏi AI về ${session.studentName}` : "Fpilot"}
              </h2>
              <div className="relative z-10 flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={minimizeStudentChat}
                  ref={minimizeButtonRef}
                  className={controlClassName}
                  aria-label="Thu nhỏ khung chat Fpilot"
                  title="Thu nhỏ"
                >
                  <Minus size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={requestChatClose}
                  ref={closeButtonRef}
                  aria-label="Đóng cuộc trò chuyện Fpilot"
                  title="Đóng"
                  className={controlClassName}
                >
                  <CloseIcon />
                </button>
              </div>
            </header>
          ) : null}

          {hasOpened || isActive ? (
            <iframe
              ref={iframeRef}
              src={CRM_CHATBOT_POPOVER_URL}
              title={session ? `Chatbot về ${session.studentName}` : "CRM Chatbot"}
              allow="microphone"
              tabIndex={isActive ? 0 : -1}
              className="min-h-0 flex-1 border-0 bg-card-background"
            />
          ) : null}

          {mode === "compact" ? (
            <>
              <button
                type="button"
                {...handleProps}
                aria-label="Di chuyển khung chat"
                title="Kéo để di chuyển. Dùng phím mũi tên khi chọn nút này."
                className={cn(
                  "absolute top-0 left-14 z-10 h-16 w-28 touch-none rounded-lg focus-visible:outline-2 focus-visible:outline-primary-500",
                  dragging ? "cursor-grabbing" : "cursor-grab",
                )}
              >
                <span className="sr-only">Di chuyển khung chat</span>
              </button>
              <button
                type="button"
                onClick={requestChatClose}
                aria-label="Đóng CRM Chatbot"
                className="absolute top-3 right-3 z-20 inline-flex size-8 items-center justify-center rounded-full bg-card-surface-area text-icon-secondary transition-colors hover:bg-background-gray-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                <CloseIcon />
              </button>
            </>
          ) : null}
        </section>
      ) : null}

      {mode === "closed" ? (
        <button
          type="button"
          onClick={openChatbot}
          {...handleProps}
          data-student-fpilot-launcher="true"
          aria-label="Mở CRM Chatbot"
          aria-expanded={false}
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
