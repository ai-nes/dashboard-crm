"use client";

import type { ReactNode } from "react";
import { Dialog, DialogTrigger } from "react-aria-components";
import { ChevronDown } from "@tailgrids/icons";

import { Button } from "@/components/tailgrids/core/button";
import { Popover } from "@/components/tailgrids/core/popover";

interface NpsHistoryFiltersProps {
  children: ReactNode;
  activeCount: number;
  onClear: () => void;
}

export default function NpsHistoryFilters({
  children,
  activeCount,
  onClear,
}: NpsHistoryFiltersProps) {
  return (
    <DialogTrigger>
      <Button
        type="button"
        appearance="outline"
        size="sm"
        className="min-h-10 shrink-0 gap-2 border-card-border text-text-secondary"
        aria-label={
          activeCount ? `Bộ lọc NPS, ${activeCount} đang áp dụng` : "Bộ lọc NPS"
        }
      >
        Bộ lọc{activeCount ? ` (${activeCount})` : ""}
        <ChevronDown size={16} aria-hidden="true" />
      </Button>
      <Popover
        placement="bottom end"
        offset={8}
        className="w-[min(22rem,calc(100vw-2rem))] bg-card-background p-4 text-text-primary shadow-sm transition-[opacity,transform] duration-200 data-entering:translate-y-1 data-entering:opacity-0 data-exiting:translate-y-1 data-exiting:opacity-0 motion-reduce:transition-none"
      >
        <Dialog aria-label="Bộ lọc lịch sử NPS" className="outline-none">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-text-primary">
              Bộ lọc NPS
            </h4>
            {activeCount ? (
              <Button
                type="button"
                appearance="ghost"
                size="sm"
                onPress={onClear}
              >
                Xóa bộ lọc
              </Button>
            ) : null}
          </div>
          <div className="space-y-4">{children}</div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
