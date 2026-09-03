import { Phone } from "@tailgrids/icons";

import type { ActionCardProps } from "./card-types";
import { PackageList } from "./package-section";

/**
 * Fallback card for an action whose `actionType` is missing or unknown — keeps
 * the workspace usable against an older backend or a new server-side type.
 */
export default function GenericActionCard({ action }: ActionCardProps) {
  const hasActivity = action.recentActivity.length > 0;
  const hasPoints = action.talkingPoints.length > 0;

  if (!hasActivity && !hasPoints) {
    return (
      <p className="text-sm leading-6 text-text-tertiary">
        Chưa có hướng dẫn chi tiết. Xử lý dựa trên bối cảnh học viên ở trên.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <PackageList label="Gợi ý trao đổi" values={action.talkingPoints} />
      {hasActivity && (
        <div>
          <h4 className="text-xs font-medium text-text-tertiary">
            Hoạt động gần đây
          </h4>
          <ul className="mt-2 space-y-2">
            {action.recentActivity.map((activity) => (
              <li
                key={activity.id ?? activity.label}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <span className="flex items-center gap-2 text-text-secondary">
                  <Phone size={14} aria-hidden="true" />
                  {activity.label}
                </span>
                <time className="shrink-0 text-xs text-text-tertiary">
                  {activity.time}
                </time>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
