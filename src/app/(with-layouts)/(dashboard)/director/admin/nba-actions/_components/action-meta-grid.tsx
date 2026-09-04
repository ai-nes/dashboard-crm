import { Badge } from "@/components/tailgrids/core/badge";
import type { NbaAction } from "@/services/api/nba-actions";

interface ActionMetaGridProps {
  action: NbaAction;
}

export default function ActionMetaGrid({ action }: ActionMetaGridProps) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-card-border bg-background-gray-primary p-3">
        <dt className="text-xs font-medium text-text-tertiary">Loại Action</dt>
        <dd className="mt-1 text-sm font-medium text-text-primary">
          {action.actionType ?? "Chưa phân loại"}
        </dd>
      </div>
      <div className="rounded-lg border border-card-border bg-background-gray-primary p-3">
        <dt className="text-xs font-medium text-text-tertiary">Kênh mặc định</dt>
        <dd className="mt-1 text-sm font-medium text-text-primary">
          {action.defaultChannel ?? "Chưa thiết lập"}
        </dd>
      </div>
      <div className="rounded-lg border border-card-border bg-background-gray-primary p-3 sm:col-span-2">
        <dt className="text-xs font-medium text-text-tertiary">Trạng thái</dt>
        <dd className="mt-1">
          <Badge color={action.enabled ? "success" : "gray"}>
            {action.enabled ? "Đang bật" : "Đang tắt"}
          </Badge>
        </dd>
      </div>
    </dl>
  );
}
