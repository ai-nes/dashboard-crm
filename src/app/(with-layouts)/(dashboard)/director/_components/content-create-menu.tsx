"use client";

import { ChevronDown, Plus } from "@tailgrids/icons";
import { useEffect, useRef, useState } from "react";
import { Menu, MenuItem } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import { Popover } from "@/components/tailgrids/core/popover";

const closeDelay = 140;

export default function ContentCreateMenu({
  onCreateNew,
  onCreateFromTemplate,
}: {
  onCreateNew?: () => void;
  onCreateFromTemplate?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const clearCloseTimer = () => {
    if (!closeTimerRef.current) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const openMenu = () => {
    clearCloseTimer();
    setIsOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, closeDelay);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    onCreateNew?.();
  };

  const handleCreateFromTemplate = () => {
    setIsOpen(false);
    onCreateFromTemplate?.();
  };

  return (
    <div
      ref={triggerRef}
      className="relative shrink-0"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onFocusCapture={openMenu}
    >
      <Button
        size="sm"
        className="group"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onPress={openMenu}
      >
        <Plus size={16} aria-hidden="true" />
        Tạo
        <ChevronDown
          size={14}
          aria-hidden="true"
          className="transition-transform group-aria-expanded:rotate-180"
        />
      </Button>

      {isOpen && (
        <Popover
          aria-label="Tuỳ chọn tạo"
          isOpen
          isNonModal
          triggerRef={triggerRef}
          placement="bottom end"
          offset={6}
          className="z-50 min-w-48 overflow-hidden rounded-xl border border-card-border bg-background-white-secondary p-1 shadow-lg"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
          onOpenChange={(open) => {
            if (!open) setIsOpen(false);
          }}
        >
          <Menu aria-label="Tạo nội dung" className="outline-none">
            <MenuItem
              id="new"
              onAction={handleCreateNew}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-text-secondary outline-none data-[focused=true]:bg-background-gray-secondary_alt data-[focused=true]:text-text-primary"
            >
              Tạo mới
            </MenuItem>
            <MenuItem
              id="from-template"
              onAction={handleCreateFromTemplate}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-text-secondary outline-none data-[focused=true]:bg-background-gray-secondary_alt data-[focused=true]:text-text-primary"
            >
              Tạo từ mẫu
            </MenuItem>
          </Menu>
        </Popover>
      )}
    </div>
  );
}
