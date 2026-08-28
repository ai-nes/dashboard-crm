import { cn } from "@/utils/cn";
import type { ActivityType } from "@/services/api/saas";

const ACTIVITY_ICON_CONFIG: Record<ActivityType, { letter: string; className: string }> = {
  new_signup: {
    letter: "N",
    className: "bg-badge-primary-background text-badge-primary-text",
  },
  upgrade: {
    letter: "U",
    className: "bg-badge-success-background text-badge-success-text",
  },
  downgrade: {
    letter: "D",
    className: "bg-badge-warning-background text-badge-warning-text",
  },
  cancellation: {
    letter: "C",
    className: "bg-badge-error-background text-badge-error-text",
  },
  payment_failed: {
    letter: "P",
    className: "bg-badge-rose-background text-badge-rose-text",
  },
  trial_started: {
    letter: "T",
    className: "bg-badge-blue-background text-badge-blue-text",
  },
};

export function ActivityIcon({ type }: { type: ActivityType }) {
  const config = ACTIVITY_ICON_CONFIG[type];

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        config.className,
      )}
      aria-hidden="true"
    >
      {config.letter}
    </span>
  );
}
