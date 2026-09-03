import { ClockThree } from "@tailgrids/icons";

import { scrubCopy } from "./sanitize";

interface WaitPanelProps {
  /** Why no action is needed right now. */
  reason: string | null;
  /** When the case should be revisited (already formatted for display). */
  revisitAt: string | null;
}

/**
 * Rendered when the NBA disposition is `WAIT` — the best next step is to do
 * nothing yet (e.g. the student was contacted hours ago). No action controls.
 */
export default function WaitPanel({ reason, revisitAt }: WaitPanelProps) {
  return (
    <div
      className="rounded-lg bg-background-soft-50 p-4"
      aria-label="Chưa cần hành động"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <ClockThree size={16} aria-hidden="true" />
        Chưa cần hành động
      </p>
      {reason && (
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {scrubCopy(reason)}
        </p>
      )}
      {revisitAt && (
        <p className="mt-2 text-xs text-text-tertiary">
          Xem lại từ ngày {revisitAt}
        </p>
      )}
    </div>
  );
}
