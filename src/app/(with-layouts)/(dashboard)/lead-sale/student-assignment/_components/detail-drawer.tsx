"use client";

import { Close } from "@tailgrids/icons";
import type { ReactNode } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { Button } from "@/components/tailgrids/core/button";

interface DetailDrawerProps {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}

export default function DetailDrawer({
  title,
  subtitle,
  onClose,
  children,
}: DetailDrawerProps) {
  return (
    <ModalOverlay
      isOpen
      isDismissable
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      className="fixed inset-0 z-[100] bg-text-primary/25"
    >
      <Modal className="absolute inset-y-0 right-0 w-full max-w-lg border-l border-card-border bg-card-background shadow-xl">
        <Dialog className="flex h-full flex-col outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-card-border p-5 sm:p-6">
            <div>
              <p className="mb-1.5 text-xs font-medium text-text-tertiary">
                {subtitle}
              </p>
              <Heading
                slot="title"
                className="text-xl font-semibold text-text-primary"
              >
                {title}
              </Heading>
            </div>
            <Button
              autoFocus
              appearance="ghost"
              iconOnly
              size="lg"
              aria-label="Đóng chi tiết"
              onPress={onClose}
              className="shrink-0 text-text-secondary"
            >
              <Close size={18} />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            {children}
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
