"use client";

import { useId } from "react";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/tailgrids/core/badge";
import { Toggle } from "@/components/tailgrids/core/toggle";
import type {
  LeadRoutingPolicy,
  LeadRoutingLayerKey,
} from "@/services/api/lead-sale";
import LeadRoutingTeamSettings, {
  type RoutingTeamOption,
} from "./lead-routing-team-settings";
import {
  getLeadRoutingMode,
  LEAD_ROUTING_MODES,
} from "./lead-routing-mode-options";

type Props = {
  policy: LeadRoutingPolicy;
  canEdit: boolean;
  isSaving: boolean;
  teamOptions?: RoutingTeamOption[];
  onChange: (policy: LeadRoutingPolicy) => void;
};

export default function LeadRoutingSettings({
  policy,
  canEdit,
  isSaving,
  teamOptions = [],
  onChange,
}: Props) {
  const radioName = useId();
  if (!policy) return null;
  const mode = getLeadRoutingMode(policy);

  function changeMode(value: string | null) {
    if (!canEdit || isSaving || !value || !(value in LEAD_ROUTING_MODES))
      return;
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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Tự động phân công
          </h3>
          {!policy.enabled && (
            <p className="mt-1 text-xs text-text-secondary">
              Đang tắt. Cấu hình được giữ lại.
            </p>
          )}
        </div>
        {canEdit ? (
          <Toggle
            aria-label="Tự động phân công"
            size="md"
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
          <fieldset>
            <legend className="sr-only">Cách phân công Lead</legend>
            <div className="grid gap-3 @2xl:grid-cols-3">
              {Object.entries(LEAD_ROUTING_MODES).map(([key, entry]) => (
                <label
                  key={key}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors focus-within:ring-2 focus-within:ring-primary-500/30 motion-reduce:transition-none",
                    key === mode
                      ? "border-primary-500/60 bg-badge-primary-background"
                      : "border-card-border bg-card-background hover:bg-background-gray-secondary",
                    isSaving && "cursor-wait opacity-60",
                  )}
                >
                  <input
                    type="radio"
                    name={radioName}
                    value={key}
                    checked={mode === key}
                    disabled={isSaving}
                    aria-label={entry.label}
                    onChange={() => changeMode(key)}
                    className="mt-0.5 size-5 shrink-0 cursor-pointer text-primary-500 accent-primary-500 focus:ring-primary-500 disabled:cursor-wait"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-6 text-text-primary">
                      {entry.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-text-secondary">
                      {entry.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-primary">
              {LEAD_ROUTING_MODES[mode].label}
            </p>
            <p className="text-sm leading-6 text-text-secondary">
              {LEAD_ROUTING_MODES[mode].description}
            </p>
          </div>
        )}
        <p className="text-xs leading-5 text-text-secondary">
          {policy.distributionStrategy === "round_robin"
            ? "Chia luân phiên theo lượt."
            : "Ưu tiên Sales có ít Lead hơn."}
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
          <p className="text-sm leading-6 text-text-secondary">
            Thiết lập team trong chi tiết chiến dịch.
          </p>
        )}
      </section>
    </div>
  );
}
