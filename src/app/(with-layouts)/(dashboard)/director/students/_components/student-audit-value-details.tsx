"use client";

import { DialogTrigger } from "react-aria-components";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Backdrop } from "@/components/tailgrids/core/overlay";
import type { StudentAuditLog } from "@/services/api/student-audit";
import type { StudentAuditFieldChange } from "./student-audit-changes";
import StudentAuditStructuredValue from "./student-audit-structured-value";
import { summarizeStudentAuditValue } from "./student-audit-summary";

export default function StudentAuditValueDetails({
  change,
  action,
}: {
  change: StudentAuditFieldChange;
  action: StudentAuditLog["action"];
}) {
  const value = action === "deleted" ? change.oldValue : change.newValue;
  return (
    <div className="min-w-0 max-w-3xl space-y-1">
      <p className="break-words text-text-primary [overflow-wrap:anywhere]">
        {summarizeStudentAuditValue(change.fieldname, value)}
      </p>
      <DialogTrigger>
        <Button
          appearance="ghost"
          size="xs"
          className="w-auto px-0 text-xs text-badge-sky-text"
          aria-label={`Xem chi tiết: ${change.fieldLabel}`}
          aria-haspopup="dialog"
        >
          Xem chi tiết
        </Button>
        <Backdrop>
          <Dialog
            showCloseButton={false}
            className="flex max-h-[85dvh] max-w-3xl flex-col overflow-hidden p-0"
          >
            <DialogHeader className="shrink-0 border-b border-card-border px-5 py-4 sm:px-6">
              <DialogTitle className="break-words leading-6">
                {change.fieldLabel}
              </DialogTitle>
            </DialogHeader>
            <DialogBody className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 text-text-secondary [overflow-wrap:anywhere] sm:px-6">
              <dl className="space-y-5 divide-y divide-card-border">
                {action === "updated" && (
                  <div>
                    <dt className="mb-3 font-semibold text-text-primary">
                      Trước thay đổi
                    </dt>
                    <dd>
                      <StudentAuditStructuredValue
                        field={change.fieldname}
                        value={change.oldValue}
                      />
                    </dd>
                  </div>
                )}
                <div className={action === "updated" ? "pt-5" : undefined}>
                  <dt className="mb-3 font-semibold text-text-primary">
                    {action === "updated" ? "Sau thay đổi" : "Nội dung"}
                  </dt>
                  <dd>
                    <StudentAuditStructuredValue
                      field={change.fieldname}
                      value={value}
                    />
                  </dd>
                </div>
              </dl>
            </DialogBody>
            <DialogFooter className="shrink-0 border-t border-card-border px-5 py-4 sm:px-6">
              <DialogClose appearance="outline" size="sm">
                Đóng
              </DialogClose>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      </DialogTrigger>
    </div>
  );
}
