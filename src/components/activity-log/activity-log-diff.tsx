import { ArrowRight } from "@tailgrids/icons";

import { displayAuditValue } from "./activity-log-utils";

interface ActivityLogDiffProps {
  oldValue: unknown;
  newValue: unknown;
  compact?: boolean;
}

export default function ActivityLogDiff({
  oldValue,
  newValue,
  compact = false,
}: ActivityLogDiffProps) {
  const oldDisplayValue = displayAuditValue(oldValue);
  const newDisplayValue = displayAuditValue(newValue);
  const isUnchanged = oldDisplayValue === newDisplayValue;

  if (isUnchanged) {
    return (
      <span className="inline-flex rounded-md bg-background-gray-secondary px-2 py-1 text-xs text-text-secondary">
        {oldDisplayValue === "Không có" ? "Không có thay đổi" : oldDisplayValue}
      </span>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 ${compact ? "text-xs" : "text-sm"}`}
    >
      <span
        className="max-w-full break-words rounded-md bg-background-gray-secondary px-2 py-1 text-text-secondary"
        title={oldDisplayValue}
      >
        {oldDisplayValue}
      </span>
      <ArrowRight
        size={14}
        className="shrink-0 text-text-tertiary"
        aria-hidden="true"
      />
      <span
        className="max-w-full break-words rounded-md bg-primary-500/10 px-2 py-1 font-medium text-primary-700 dark:text-primary-300"
        title={newDisplayValue}
      >
        {newDisplayValue}
      </span>
    </div>
  );
}
