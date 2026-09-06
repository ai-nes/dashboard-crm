"use client";

import { FileText } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import type {
  StudentZaloMessage,
  StudentZaloMessageStatus,
} from "@/services/api/students/types";
import { formatDateTime } from "@/utils/format-date";

export const zaloMessageStatusConfig: Record<
  StudentZaloMessageStatus,
  { label: string; color: "gray" | "primary" | "success" | "error" }
> = {
  sent: { label: "Đã gửi", color: "gray" },
  delivered: { label: "Đã nhận", color: "primary" },
  read: { label: "Đã xem", color: "success" },
  failed: { label: "Gửi lỗi", color: "error" },
};

interface StudentZaloMessageDetailsProps {
  message: StudentZaloMessage;
}

export default function StudentZaloMessageDetails({
  message,
}: StudentZaloMessageDetailsProps) {
  const status = zaloMessageStatusConfig[message.status ?? "sent"];
  const isOutbound = message.direction === "outbound";

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">
            {message.senderName}
            {message.senderRole ? (
              <span className="ml-2 font-normal text-text-tertiary">
                {message.senderRole}
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs text-text-tertiary">
            Gửi đến {message.recipientName}
          </p>
        </div>
        <time className="shrink-0 text-xs text-text-tertiary">
          {formatDateTime(message.time)}
        </time>
      </div>

      <div
        className={
          isOutbound
            ? "mt-3 w-fit max-w-2xl rounded-2xl rounded-br-md bg-badge-sky-background px-4 py-3"
            : "mt-3 w-fit max-w-2xl rounded-2xl rounded-bl-md bg-background-gray-secondary px-4 py-3"
        }
      >
        <p className="whitespace-pre-line text-sm leading-6 text-text-primary">
          {message.content}
        </p>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
        <Badge color={isOutbound ? "sky" : "gray"}>
          {isOutbound ? "Tin nhắn gửi" : "Tin nhắn đến"}
        </Badge>
        <Badge color={status.color}>{status.label}</Badge>
        {message.attachmentName ? (
          <Badge color="primary" prefixIcon={<FileText size={12} />}>
            {message.attachmentName}
          </Badge>
        ) : null}
      </div>
    </>
  );
}
