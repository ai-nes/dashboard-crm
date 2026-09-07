"use client";

import { DialogTrigger } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import { Popover } from "@/components/tailgrids/core/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";

import LeadCallRecording from "./lead-call-recording";

interface LeadContactLogCellProps {
  compact?: boolean;
  leadName: string;
  noAnswer: number;
  success: number;
}

export default function LeadContactLogCell({
  leadName,
  noAnswer,
  success,
  compact = false,
}: LeadContactLogCellProps) {
  const total = noAnswer + success;

  return (
    <Tooltip placement="top">
      <TooltipTrigger asChild>
        <span className="inline-block">
          <DialogTrigger>
            <Button
              type="button"
              appearance="ghost"
              size="xs"
              className={
                compact
                  ? "h-7 gap-1 rounded-full bg-background-gray-secondary px-2.5 py-0 text-text-secondary hover:bg-background-soft-50"
                  : "gap-1 px-1.5 py-1 hover:bg-background-soft-50"
              }
              aria-label={`Xem lịch sử liên hệ với ${leadName}, hiện ${total} lần`}
            >
              <span
                className={
                  compact
                    ? "text-xs font-medium tabular-nums text-text-secondary"
                    : `text-lg leading-none font-bold tabular-nums ${
                        total > 0
                          ? "text-badge-primary-text"
                          : "text-text-tertiary"
                      }`
                }
              >
                {compact ? `${total} lần liên hệ` : total}
              </span>
            </Button>
            <Popover className="w-80 p-4">
              <p className="text-sm font-semibold text-text-primary">
                Lịch sử liên hệ
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-text-secondary">
                    Không bắt máy
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-text-primary">
                    {noAnswer}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-text-secondary">
                    Liên hệ thành công
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-text-primary">
                    {success}
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <span className="text-xs font-medium text-text-tertiary">
                  Ghi âm cuộc gọi
                </span>
                <LeadCallRecording />
              </div>
            </Popover>
          </DialogTrigger>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs whitespace-nowrap">
          Liên hệ thành công: <span className="font-semibold">{success}</span> ·
          Không bắt máy: <span className="font-semibold">{noAnswer}</span>
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
