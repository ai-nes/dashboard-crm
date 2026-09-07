"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Close } from "@tailgrids/icons";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";

import { DialogClose } from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import { cn } from "@/utils/cn";

interface TaskDialogContextValue {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  close: () => void;
}

const TaskDialogContext = createContext<TaskDialogContextValue | null>(null);

export function useTaskDialog() {
  return useContext(TaskDialogContext);
}

export interface TaskCreateDialogShellProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ariaLabel: string;
  children: ReactNode;
  isFullscreen?: boolean;
  hideDefaultClose?: boolean;
  className?: string;
}

export default function TaskCreateDialogShell({
  isOpen,
  onOpenChange,
  ariaLabel,
  children,
  isFullscreen: externalIsFullscreen,
  hideDefaultClose = true,
  className,
}: TaskCreateDialogShellProps) {
  const [internalIsFullscreen, setInternalIsFullscreen] = useState(false);

  const isFullscreen =
    externalIsFullscreen !== undefined
      ? externalIsFullscreen
      : internalIsFullscreen;
  const toggleFullscreen = () => setInternalIsFullscreen((prev) => !prev);
  const close = () => onOpenChange(false);

  return (
    <TaskDialogContext.Provider
      value={{ isFullscreen, toggleFullscreen, close }}
    >
      <Backdrop
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="ease-out data-entering:opacity-0 data-exiting:opacity-0 motion-reduce:transition-none motion-reduce:data-entering:opacity-100 motion-reduce:data-exiting:opacity-100"
      >
        <AriaModal className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5">
          <AriaDialog
            aria-label={ariaLabel}
            className={cn(
              "relative flex w-full flex-col overflow-hidden rounded-xl border border-card-border bg-background-white-primary shadow-2xl outline-none transition-[opacity,transform] duration-200 ease-out",
              isFullscreen
                ? "h-[96vh] max-w-[98vw]"
                : "max-h-[calc(100vh-2rem)] sm:max-h-[88vh] max-w-[1040px]",
              "data-entering:translate-y-2 data-entering:scale-95 data-entering:opacity-0 data-exiting:translate-y-2 data-exiting:scale-95 data-exiting:opacity-0 motion-reduce:transition-none motion-reduce:data-entering:translate-y-0 motion-reduce:data-entering:scale-100 motion-reduce:data-entering:opacity-100 motion-reduce:data-exiting:translate-y-0 motion-reduce:data-exiting:scale-100 motion-reduce:data-exiting:opacity-100",
              className,
            )}
          >
            {!hideDefaultClose && (
              <DialogClose
                iconOnly
                size="sm"
                variant="ghost"
                aria-label="Đóng"
                className="absolute top-3 right-3 z-10 text-text-secondary opacity-70 hover:bg-transparent hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <Close />
              </DialogClose>
            )}
            {children}
          </AriaDialog>
        </AriaModal>
      </Backdrop>
    </TaskDialogContext.Provider>
  );
}
