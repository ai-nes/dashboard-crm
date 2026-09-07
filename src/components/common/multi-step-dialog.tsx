"use client";

import { Close } from "@tailgrids/icons";
import type { FormEventHandler, ReactNode } from "react";
import {
  Dialog as AriaDialog,
  Modal as AriaModal,
} from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";

interface MultiStepDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  ariaLabel?: string;
  steps: string[];
  currentStep: number;
  isBusy?: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  footer: ReactNode;
  children: ReactNode;
}

export function MultiStepDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  ariaLabel,
  steps,
  currentStep,
  isBusy = false,
  onSubmit,
  footer,
  children,
}: MultiStepDialogProps) {
  const handleOpenChange = (open: boolean) => {
    if (open || !isBusy) onOpenChange(open);
  };

  return (
    <Backdrop
      isOpen={isOpen}
      isDismissable={!isBusy}
      onOpenChange={handleOpenChange}
    >
      <AriaModal className="fixed top-1/2 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 max-sm:max-w-[calc(100%-2rem)]">
        <AriaDialog
          aria-label={ariaLabel ?? title}
          className="relative flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-border-primary bg-background-white-primary shadow-lg outline-none"
        >
          <Button
            aria-label="Đóng"
            className="absolute top-4 right-4 z-10 text-text-100 opacity-70 hover:bg-transparent hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-500"
            iconOnly
            isDisabled={isBusy}
            onPress={() => onOpenChange(false)}
            size="sm"
            variant="ghost"
          >
            <Close aria-hidden="true" />
          </Button>
          <DialogHeader className="border-b border-card-border px-6 py-5 pr-14">
            <DialogTitle className="text-xl leading-7">{title}</DialogTitle>
            <DialogDescription className="text-text-tertiary">
              {description}
            </DialogDescription>
            <ol
              className="mt-4 flex flex-wrap items-center gap-2"
              aria-label="Tiến trình biểu mẫu"
            >
              {steps.map((step, index) => (
                <li
                  key={step}
                  aria-current={index === currentStep ? "step" : undefined}
                  className={
                    index === currentStep
                      ? "inline-flex items-center gap-1.5 rounded-full bg-badge-primary-background px-2.5 py-1 text-xs font-semibold text-badge-primary-text"
                      : index < currentStep
                        ? "inline-flex items-center gap-1.5 rounded-full bg-badge-success-background px-2.5 py-1 text-xs font-medium text-badge-success-text"
                        : "inline-flex items-center gap-1.5 rounded-full bg-background-soft-50 px-2.5 py-1 text-xs text-text-tertiary"
                  }
                >
                  <span aria-hidden="true">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </DialogHeader>
          <form onSubmit={onSubmit}>
            <DialogBody className="max-h-[calc(100vh-15rem)] space-y-4 overflow-y-auto px-6 py-5">
              {children}
            </DialogBody>
            <DialogFooter className="border-t border-card-border px-6 py-4">
              {footer}
            </DialogFooter>
          </form>
        </AriaDialog>
      </AriaModal>
    </Backdrop>
  );
}
