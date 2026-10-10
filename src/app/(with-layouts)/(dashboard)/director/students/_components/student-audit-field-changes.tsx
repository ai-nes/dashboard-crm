import { ArrowRight } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import {
  formatStudentAuditChangeValue,
  type StudentAuditFieldChange,
} from "./student-audit-changes";
import type { StudentAuditLog } from "@/services/api/student-audit";

export default function StudentAuditFieldChanges({
  changes,
  action,
}: {
  changes: StudentAuditFieldChange[];
  action: StudentAuditLog["action"];
}) {
  const isUpdate = action === "updated";

  return (
    <dl className="space-y-2 text-sm leading-6">
      {changes.map((change) => (
        <div
          key={change.fieldname}
          className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1"
        >
          <dt className="max-w-full">
            <Badge
              color="sky"
              size="sm"
              className="max-w-full border border-badge-sky-text/25 whitespace-normal break-words font-semibold"
            >
              {change.fieldLabel}
            </Badge>
          </dt>
          <dd className="flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1">
            {isUpdate && (
              <>
                <span className="max-w-full whitespace-pre-wrap break-words text-text-secondary">
                  <span className="sr-only">từ </span>
                  {formatStudentAuditChangeValue(
                    change.fieldname,
                    change.oldValue,
                  )}
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-badge-sky-text"
                  aria-hidden="true"
                />
              </>
            )}
            <span className="max-w-full whitespace-pre-wrap break-words font-semibold text-badge-sky-text">
              {isUpdate && <span className="sr-only">tới </span>}
              {formatStudentAuditChangeValue(
                change.fieldname,
                action === "deleted" ? change.oldValue : change.newValue,
              )}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
