"use client";

import { useState } from "react";

import { DialogTrigger } from "react-aria-components";

import { Button } from "@/components/tailgrids/core/button";
import { Popover } from "@/components/tailgrids/core/popover";
import { CallLogPopoverSkeleton } from "@/app/(with-layouts)/(dashboard)/director/students/_components/student-activity-skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/tailgrids/core/tooltip";
import { useLeadCallLogsQuery } from "@/hooks/use-lead-call-logs-query";
import type { LeadCallRecord } from "@/services/api/lead-sale/call-logs";
import { formatDateTime } from "@/utils/format-date";

import LeadCallRecording from "./lead-call-recording";

interface LeadContactLogCellProps {
  compact?: boolean;
  leadId: string;
  leadName: string;
  noAnswer: number;
  success: number;
}

const callDirectionLabel: Record<LeadCallRecord["direction"], string> = {
  inbound: "Cuộc gọi đến",
  outbound: "Cuộc gọi đi",
  missed: "Cuộc gọi nhỡ",
};

function formatCallDuration(value?: number): string {
  if (!value || value <= 0) return "Không kết nối";
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function LeadContactLogCell({
  leadId,
  leadName,
  noAnswer,
  success,
  compact = false,
}: LeadContactLogCellProps) {
  const total = noAnswer + success;
  const [isOpen, setIsOpen] = useState(false);
  // Chỉ gọi API cuộc gọi khi người dùng thực sự mở popover.
  const callLogsQuery = useLeadCallLogsQuery(leadId, { enabled: isOpen });
  const calls = callLogsQuery.data?.calls ?? [];

  return (
    <Tooltip placement="top">
      <TooltipTrigger asChild>
        <span className="inline-block">
          <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
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
            <Popover className="w-[22rem] p-4">
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

              {isOpen &&
                (callLogsQuery.isPending ? (
                  <CallLogPopoverSkeleton />
                ) : callLogsQuery.isError ? (
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-card-border pt-3">
                    <p className="text-xs text-error-600">
                      Không thể tải ghi âm cuộc gọi.
                    </p>
                    <Button
                      type="button"
                      appearance="outline"
                      size="xs"
                      onPress={() => void callLogsQuery.refetch()}
                    >
                      Thử lại
                    </Button>
                  </div>
                ) : calls.length === 0 ? null : (
                  <div className="mt-4 space-y-3 border-t border-card-border pt-3">
                    <span className="text-xs font-medium text-text-tertiary">
                      Ghi âm cuộc gọi ({calls.length})
                    </span>
                    <div className="max-h-[360px] space-y-3 overflow-y-auto">
                      {calls.map((call) => (
                        <div key={call.id} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-xs text-text-tertiary">
                            <span>
                              {callDirectionLabel[call.direction]} ·{" "}
                              {formatDateTime(call.time)}
                            </span>
                            <span className="shrink-0 tabular-nums">
                              {formatCallDuration(call.durationSeconds)}
                            </span>
                          </div>
                          <LeadCallRecording
                            recordingUrl={call.recordingUrl}
                            durationSeconds={call.durationSeconds}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
