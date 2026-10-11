"use client";

import { CloseIcon } from "@/components/common/sidebar/icon";
import { ExpandSquare4, MenuMeatballs1, Minus } from "@tailgrids/icons";
import { useStudentFpilotChat } from "@/components/common/crm-chatbot/student-fpilot-chat-context";
import {
  CRM_CHATBOT_FULLSCREEN_URL,
  CRM_CHATBOT_ORIGIN,
} from "@/components/common/crm-chatbot/config";
import { useChatbotClose } from "@/components/common/crm-chatbot/use-chatbot-close";
import { useFloatingChatPosition } from "@/components/common/crm-chatbot/use-floating-chat-position";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

export default function StudentAskAIDialog() {
  const {
    mode,
    session,
    isActive,
    minimizeStudentChat,
    expandStudentChat,
    closeApprovedStudentChat,
  } = useStudentFpilotChat();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const minimizeButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const previousModeRef = useRef(mode);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const restoreOutsideRef = useRef<(() => void) | null>(null);
  const [readyOpening, setReadyOpening] = useState<number | null>(null);
  const onCloseApproved = useCallback(() => {
    if (session) closeApprovedStudentChat(session.opening);
  }, [closeApprovedStudentChat, session]);
  const requestClose = useChatbotClose(iframeRef, onCloseApproved, isActive);
  const { containerRef, position, dragging, handleProps } =
    useFloatingChatPosition(mode === "minimized");
  const src = useMemo(() => {
    if (!session) return "";
    const url = new URL(CRM_CHATBOT_FULLSCREEN_URL);
    url.searchParams.set("studentId", session.studentId);
    url.searchParams.set("opening", String(session.opening));
    return url.toString();
  }, [session]);

  useEffect(() => {
    if (!isActive) return;
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (
        event.source !== iframeRef.current?.contentWindow ||
        event.origin !== CRM_CHATBOT_ORIGIN
      )
        return;
      const message = event.data as {
        type?: unknown;
        direction?: unknown;
      } | null;
      if (message?.type === "crm-chatbot:host-tab-boundary") {
        if (mode !== "expanded") return;
        if (message.direction === "forward") minimizeButtonRef.current?.focus();
        else if (message.direction === "backward")
          closeButtonRef.current?.focus();
        return;
      }
      if (message?.type === "crm-chatbot:lifecycle-ready") {
        if (session) setReadyOpening(session.opening);
        return;
      }
      if (message?.type === "crm-chatbot:host-close-request") {
        if (mode === "expanded") requestClose();
        return;
      }
      if (message?.type === "crm-chatbot:expand") {
        const url = new URL(src);
        url.searchParams.delete("mode");
        window.open(url.toString(), "_blank", "noopener,noreferrer");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isActive, mode, requestClose, session, src]);

  useEffect(() => {
    if (!isActive || !session || readyOpening !== session.opening) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "crm-chatbot:student-fpilot-mode", mode },
      CRM_CHATBOT_ORIGIN,
    );
  }, [isActive, mode, readyOpening, session]);

  useLayoutEffect(() => {
    const previousMode = previousModeRef.current;
    const dialog = dialogRef.current;

    if (mode === "expanded" && dialog) {
      if (previousMode === "closed") {
        const active = document.activeElement;
        returnFocusRef.current =
          active instanceof HTMLElement && active !== document.body
            ? active
            : document.querySelector<HTMLElement>(
                "[data-student-fpilot-trigger]",
              );
      }
      restoreOutsideRef.current?.();
      restoreOutsideRef.current = makeOutsideInert(dialog);
      dialog.focus();
    } else if (previousMode === "expanded" && mode === "minimized") {
      restoreOutsideRef.current?.();
      restoreOutsideRef.current = null;
      requestAnimationFrame(() => expandButtonRef.current?.focus());
    } else if (previousMode !== "closed" && mode === "closed") {
      restoreOutsideRef.current?.();
      restoreOutsideRef.current = null;
      requestAnimationFrame(() => {
        const target = returnFocusRef.current;
        if (target?.isConnected) target.focus();
        else
          document
            .querySelector<HTMLElement>("[data-student-fpilot-trigger]")
            ?.focus();
        returnFocusRef.current = null;
      });
    }

    previousModeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (mode !== "expanded") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (event.defaultPrevented) return;
        event.preventDefault();
        requestClose();
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
  }, [mode, requestClose]);

  useEffect(
    () => () => {
      restoreOutsideRef.current?.();
      restoreOutsideRef.current = null;
    },
    [],
  );

  if (!isActive || !session) return null;

  const isExpanded = mode === "expanded";
  const panelClassName = isExpanded
    ? "h-[min(850px,calc(100dvh-1.5rem))] w-full max-w-6xl"
    : "h-full w-full";

  return (
    <div
      ref={containerRef}
      style={isExpanded ? undefined : position}
      data-state={mode}
      className={
        isExpanded
          ? "fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
          : "fixed z-[70] h-[min(520px,calc(100dvh-2rem))] w-[min(360px,calc(100vw-2rem))] transition-[width,height,transform] duration-200 ease-out motion-reduce:transition-none"
      }
    >
      {isExpanded && (
        <button
          type="button"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          onClick={requestClose}
          data-modal-backdrop
          tabIndex={-1}
          aria-hidden="true"
          aria-label="Đóng hộp thoại tra cứu Fpilot"
        />
      )}
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal={isExpanded}
        aria-labelledby="student-fpilot-title"
        tabIndex={isExpanded ? -1 : undefined}
        className={`relative flex min-h-0 flex-col overflow-hidden border border-card-border bg-card-background shadow-2xl transition-[width,height,border-radius] duration-200 ease-out motion-reduce:transition-none ${panelClassName} ${isExpanded ? "rounded-2xl" : "rounded-2xl"}`}
      >
        <header className="relative flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-card-border px-3 py-2 sm:px-5">
          <h2
            id="student-fpilot-title"
            className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary sm:text-base"
          >
            Fpilot
          </h2>
          <div className="relative z-10 flex shrink-0 items-center gap-1">
            {isExpanded ? (
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
            ) : (
              <>
                <button
                  type="button"
                  {...handleProps}
                  className={`${controlClassName} ${dragging ? "cursor-grabbing" : "cursor-grab"} touch-none`}
                  aria-label="Di chuyển khung chat Fpilot"
                  title="Kéo để di chuyển. Dùng phím mũi tên để đổi vị trí."
                >
                  <MenuMeatballs1 size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={expandStudentChat}
                  ref={expandButtonRef}
                  className={controlClassName}
                  aria-label="Mở rộng khung chat Fpilot"
                  title="Mở rộng"
                >
                  <ExpandSquare4 size={17} aria-hidden="true" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={requestClose}
              ref={closeButtonRef}
              aria-label="Đóng cuộc trò chuyện Fpilot"
              title="Đóng"
              className={controlClassName}
            >
              <CloseIcon />
            </button>
          </div>
        </header>
        {session.canReadStudent ? (
          <iframe
            key={session.opening}
            ref={iframeRef}
            src={src}
            title={`Chatbot về ${session.studentName}`}
            allow="microphone"
            className="min-h-0 flex-1 border-0 bg-card-background"
          />
        ) : (
          <div role="alert" className="p-6 text-sm text-text-secondary">
            Bạn không có quyền xem hồ sơ học sinh này.
          </div>
        )}
      </section>
    </div>
  );
}
