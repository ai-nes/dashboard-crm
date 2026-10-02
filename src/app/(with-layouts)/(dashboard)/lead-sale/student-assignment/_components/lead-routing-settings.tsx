"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/tailgrids/core/select";
import { Badge } from "@/components/tailgrids/core/badge";
import { Toggle } from "@/components/tailgrids/core/toggle";
import type {
  LeadRoutingPolicy,
  LeadRoutingLayerKey,
} from "@/services/api/lead-sale";
import LeadRoutingTeamSettings, {
  type RoutingTeamOption,
} from "./lead-routing-team-settings";

type Props = {
  policy: LeadRoutingPolicy;
  canEdit: boolean;
  isSaving: boolean;
  teamOptions?: RoutingTeamOption[];
  onChange: (policy: LeadRoutingPolicy) => void;
};

const modes: Record<
  LeadRoutingLayerKey,
  { label: string; description: string }
> = {
  global: {
    label: "Chia đều cho toàn bộ Sales",
    description:
      "Chia luân phiên cho toàn bộ Sales đủ điều kiện (Sale/CTV Sale đang hoạt động), không giới hạn cơ sở, tỉnh hoặc team.",
  },
  group: {
    label: "Theo team/tỉnh",
    description:
      "Dùng tỉnh của Lead để chọn team ưu tiên, sau đó chia luân phiên cho Sale/CTV Sale trong team đó.",
  },
  campaign: {
    label: "Theo chiến dịch",
    description:
      "Dùng Team hoặc Team Group đã cấu hình trên Campaign của Lead, sau đó chia luân phiên trong phạm vi đó.",
  },
};

export default function LeadRoutingSettings({
  policy,
  canEdit,
  isSaving,
  teamOptions = [],
  onChange,
}: Props) {
  if (!policy) return null;
  const mode =
    policy.routingMode ??
    policy.layers.find((layer) => layer.enabled)?.key ??
    "group";

  function changeMode(value: string | null) {
    if (!canEdit || isSaving || !value || !(value in modes)) return;
    const routingMode = value as LeadRoutingLayerKey;
    onChange({
      ...policy,
      routingMode,
      distributionStrategy: "round_robin",
      layers: policy.layers.map((layer) => ({
        ...layer,
        enabled: layer.key === routingMode,
      })),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-lg bg-background-gray-secondary px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Phân bổ Lead tự động
          </h3>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {policy.enabled
              ? "Áp dụng cách phân công đã chọn."
              : "Đang tắt. Các thiết lập bên dưới được giữ để dùng khi bật lại."}
          </p>
        </div>
        {canEdit ? (
          <Toggle
            aria-label="Phân bổ Lead tự động"
            label={policy.enabled ? "Bật" : "Tắt"}
            checked={policy.enabled}
            disabled={isSaving}
            onChange={(event) =>
              onChange({ ...policy, enabled: event.target.checked })
            }
          />
        ) : (
          <Badge color="gray">{policy.enabled ? "Bật" : "Tắt"}</Badge>
        )}
      </div>
      <section className="space-y-3" aria-label="Cách phân công Lead">
        {canEdit ? (
          <Select value={mode} isDisabled={isSaving} onChange={changeMode}>
            <SelectLabel>Cách phân công Lead</SelectLabel>
            <SelectTrigger size="sm" className="h-10 w-full">
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(modes).map(([key, entry]) => (
                <SelectItem key={key} id={key} textValue={entry.label}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm font-semibold text-text-primary">
            {modes[mode].label}
          </p>
        )}
        <p className="text-sm leading-6 text-text-secondary">
          {modes[mode].description}
        </p>
        {mode === "group" && (
          <LeadRoutingTeamSettings
            options={teamOptions}
            priorities={policy.provinceTeamPriority ?? {}}
            canEdit={canEdit}
            isSaving={isSaving}
            onChange={(provinceTeamPriority) =>
              onChange({ ...policy, provinceTeamPriority })
            }
          />
        )}
        {mode === "campaign" && (
          <p className="text-xs leading-5 text-text-tertiary">
            Đích nhận Lead được thiết lập trong chi tiết chiến dịch.
          </p>
        )}
      </section>
      <p className="border-t border-card-border pt-4 text-xs leading-5 text-text-secondary">
        Thiếu cấu hình hoặc không có người nhận: Lead vào “Cần kiểm tra”, không
        chuyển sang cách phân công khác. Lead đã có người phụ trách được giữ
        nguyên.
      </p>
    </div>
  );
}
