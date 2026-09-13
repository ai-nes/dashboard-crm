"use client";

import { Close } from "@tailgrids/icons";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from "@/components/tailgrids/core/sheet";
import type { ActivityLogEntry } from "@/services/api/activity-log";
import { formatDateTime } from "@/utils/format-date";

import ActivityLogDiff from "./activity-log-diff";
import {
  displayAuditValue,
  getActivityTitle,
  getActionLabel,
  getDoctypeLabel,
  getEventTechnicalLabel,
  getFieldLabel,
  getInitials,
} from "./activity-log-utils";

interface ActivityLogDetailSheetProps {
  log: ActivityLogEntry | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ActivityLogDetailSheet({
  log,
  isOpen,
  onOpenChange,
}: ActivityLogDetailSheetProps) {
  return (
    <SheetOverlay isOpen={isOpen && Boolean(log)} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-label="Chi tiết nhật ký hoạt động"
        className="w-full max-w-full overflow-y-auto border-l border-card-border bg-card-background p-0 sm:max-w-xl"
      >
        {log ? (
          <>
            <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-card-border bg-card-background px-5 py-4 sm:px-6">
              <SheetHeader className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-xs font-semibold text-primary-700 dark:text-primary-300"
                    aria-hidden="true"
                  >
                    {getInitials(log.ownerFullName || log.owner)}
                  </span>
                  <div className="min-w-0">
                    <SheetTitle className="truncate text-base font-bold text-text-primary">
                      {getActivityTitle(log)}
                    </SheetTitle>
                    <SheetDescription className="mt-1 truncate text-xs text-text-tertiary">
                      {formatDateTime(log.occurredAt)} ·{" "}
                      {getDoctypeLabel(log.doctype)}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <Button
                size="xs"
                appearance="ghost"
                onPress={() => onOpenChange(false)}
                aria-label="Đóng bảng chi tiết"
                className="size-8 shrink-0 p-0 text-text-secondary hover:text-text-primary"
              >
                <Close size={18} />
              </Button>
            </div>

            <SheetBody className="space-y-5 px-5 py-5 sm:px-6">
              <section aria-labelledby="activity-log-summary-title">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="activity-log-summary-title"
                    className="text-sm font-semibold text-text-primary"
                  >
                    {getActivityTitle(log)}
                  </h2>
                  <Badge
                    color={log.severity === "critical" ? "warning" : "gray"}
                    prefixIcon={
                      <span
                        className="size-1.5 rounded-full bg-current"
                        aria-hidden="true"
                      />
                    }
                  >
                    {log.severity === "critical" ? "Cần chú ý" : "Thông tin"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {log.ownerFullName || "Không xác định"} đã thực hiện hoạt động
                  này vào {formatDateTime(log.occurredAt)}.
                </p>
              </section>

              <section className="rounded-xl border border-card-border bg-background-gray-secondary/40 p-4">
                <h2 className="text-xs font-semibold text-text-tertiary">
                  THAY ĐỔI
                </h2>
                <p className="mt-2 text-sm font-medium text-text-primary">
                  {getFieldLabel(log)}
                </p>
                <div className="mt-3">
                  <ActivityLogDiff
                    oldValue={log.oldValue}
                    newValue={log.newValue}
                  />
                </div>
              </section>

              <section
                className="space-y-3"
                aria-labelledby="activity-log-actor-title"
              >
                <h2
                  id="activity-log-actor-title"
                  className="text-sm font-semibold text-text-primary"
                >
                  Người thực hiện
                </h2>
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background-gray-secondary text-sm font-semibold text-text-secondary"
                    aria-hidden="true"
                  >
                    {getInitials(log.ownerFullName || log.owner)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary">
                      {log.ownerFullName || "Không xác định"}
                    </p>
                    <p className="truncate text-xs text-text-tertiary">
                      {log.owner || "Không có tài khoản"}
                    </p>
                  </div>
                </div>
              </section>

              <section
                className="space-y-3"
                aria-labelledby="activity-log-object-title"
              >
                <h2
                  id="activity-log-object-title"
                  className="text-sm font-semibold text-text-primary"
                >
                  Đối tượng tác động
                </h2>
                <dl className="grid gap-3 rounded-xl border border-card-border p-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-text-tertiary">
                      Loại đối tượng
                    </dt>
                    <dd className="mt-1 font-medium text-text-primary">
                      {getDoctypeLabel(log.doctype)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-text-tertiary">Mã đối tượng</dt>
                    <dd className="mt-1 break-all font-mono text-xs font-medium text-text-primary">
                      {log.docname || "Không có"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                className="space-y-3"
                aria-labelledby="activity-log-technical-title"
              >
                <h2
                  id="activity-log-technical-title"
                  className="text-sm font-semibold text-text-primary"
                >
                  Thông tin kỹ thuật
                </h2>
                <dl className="space-y-3 rounded-xl bg-background-gray-secondary/60 p-4 text-xs">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                    <dt className="text-text-tertiary">Loại sự kiện</dt>
                    <dd className="break-all font-mono text-text-secondary sm:text-right">
                      {getEventTechnicalLabel(log)}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                    <dt className="text-text-tertiary">Hành động</dt>
                    <dd className="font-medium text-text-secondary sm:text-right">
                      {getActionLabel(log.action)}
                    </dd>
                  </div>
                  {log.fieldname && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                      <dt className="text-text-tertiary">Tên trường</dt>
                      <dd className="break-all font-mono text-text-secondary sm:text-right">
                        {log.fieldname}
                      </dd>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                    <dt className="text-text-tertiary">Event ID</dt>
                    <dd className="break-all font-mono text-text-secondary sm:text-right">
                      {log.eventId}
                    </dd>
                  </div>
                </dl>
              </section>

              {(typeof log.oldValue === "object" ||
                typeof log.newValue === "object") && (
                <section
                  className="space-y-3"
                  aria-labelledby="activity-log-raw-title"
                >
                  <h2
                    id="activity-log-raw-title"
                    className="text-sm font-semibold text-text-primary"
                  >
                    Dữ liệu đầy đủ
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs text-text-tertiary">
                        Giá trị cũ
                      </p>
                      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-background-gray-secondary p-3 text-xs text-text-secondary">
                        {displayAuditValue(log.oldValue)}
                      </pre>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-text-tertiary">
                        Giá trị mới
                      </p>
                      <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-background-gray-secondary p-3 text-xs text-text-secondary">
                        {displayAuditValue(log.newValue)}
                      </pre>
                    </div>
                  </div>
                </section>
              )}
            </SheetBody>
          </>
        ) : null}
      </SheetContent>
    </SheetOverlay>
  );
}
