import { Calendar, Check, Envelope1, FileText, Phone, SackDollar } from "@tailgrids/icons";
import { cn } from "@/utils/cn";
import type { ActivityType } from "./types";

const ACTIVITY_ICON_MAP: Record<ActivityType, React.FC<{ className?: string }>> = {
  call: Phone,
  email: Envelope1,
  meeting: Calendar,
  deal_won: SackDollar,
  deal_lost: SackDollar,
  note: FileText,
  task_completed: Check,
};

const ACTIVITY_COLOR_MAP: Record<ActivityType, string> = {
  call: "bg-badge-cyan-background text-badge-cyan-icon-color",
  email: "bg-badge-blue-background text-badge-blue-icon-color",
  meeting: "bg-badge-primary-background text-badge-primary-icon-color",
  deal_won: "bg-badge-success-background text-badge-success-icon-color",
  deal_lost: "bg-badge-error-background text-badge-error-icon-color",
  note: "bg-badge-neutral-background text-badge-neutral-icon-color",
  task_completed: "bg-badge-success-background text-badge-success-icon-color",
};

type ActivityIconProps = {
  type: ActivityType;
};

export default function ActivityIcon({ type }: ActivityIconProps) {
  const Icon = ACTIVITY_ICON_MAP[type];

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full",
        ACTIVITY_COLOR_MAP[type],
      )}
    >
      <Icon className="size-4" />
    </div>
  );
}
