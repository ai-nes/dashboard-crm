import type { ReactNode } from "react";
import {
  ArrowLeft,
  BoxArchive1,
  Trash1,
  Envelope1,
  ClockThree,
  StarIcon,
  Reply,
  Printer,
} from "@tailgrids/icons";

interface Props {
  senderName: string;
  senderEmail: string;
  recipientName: string;
  children: ReactNode;
}

export default function ReminderGmailFrame({
  senderName,
  senderEmail,
  recipientName,
  children,
}: Props) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg border border-card-border bg-background-white-primary">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-card-border bg-background-gray-secondary/30 px-3">
        <div
          aria-hidden="true"
          className="flex items-center gap-5 text-text-secondary"
        >
          <ArrowLeft size={15} />
          <BoxArchive1 size={15} />
          <Trash1 size={15} />
          <span className="h-4 border-l border-card-border" />
          <Envelope1 size={15} />
          <ClockThree size={15} />
        </div>
        <span className="text-xs text-text-tertiary">Gmail</span>
      </div>
      <div className="shrink-0 space-y-2 px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-base font-medium text-text-primary">
            CRM FPTU: 1 quá hạn, 1 sắp đến hạn{" "}
            <span className="ml-1 rounded bg-background-gray-secondary px-1.5 py-0.5 align-middle text-[10px] font-normal text-text-secondary">
              Hộp thư đến
            </span>
          </h4>
          <Printer
            size={15}
            aria-hidden="true"
            className="shrink-0 text-text-secondary"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <div
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background-gray-secondary text-xs font-semibold text-text-secondary"
          >
            {senderName.trim().slice(0, 1).toUpperCase() || "G"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs">
              <span className="font-semibold text-text-primary">
                {senderName || "Người gửi"}
              </span>
              <span className="text-text-tertiary">
                {senderEmail ? `<${senderEmail}>` : "Chưa cấu hình Gmail gửi"}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-tertiary">
              đến {recipientName || "Sales minh họa"}
            </p>
          </div>
          <div
            aria-hidden="true"
            className="flex shrink-0 gap-3 text-text-secondary"
          >
            <StarIcon size={14} />
            <Reply size={14} />
          </div>
        </div>
      </div>
      <div className="flex min-h-0 flex-1">{children}</div>
      <div aria-hidden="true" className="flex shrink-0 gap-2 px-3 py-2">
        <span className="flex items-center gap-1.5 rounded-full border border-card-border px-3 py-1.5 text-[11px] text-text-secondary">
          <Reply size={12} />
          Trả lời
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-card-border px-3 py-1.5 text-[11px] text-text-secondary">
          <ArrowLeft size={12} className="rotate-180" />
          Chuyển tiếp
        </span>
      </div>
    </div>
  );
}
