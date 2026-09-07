import type { CampaignRecord } from "@/services/api/campaign-intelligence";
import { LEAD_STATUS_GROUPS, leadStatusCount } from "./lead-overview-model";
import { formatNumber } from "./formatters";

export function LeadOverviewTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: { campaign?: CampaignRecord } }> }) {
  const campaign = payload?.[0]?.payload?.campaign;
  if (!active || !campaign) return null;
  return (
    <div className="max-w-72 rounded-lg border border-card-border bg-card-background p-3 text-xs shadow-lg">
      <p className="mb-2 font-semibold text-text-primary">{campaign.name}</p>
      <p className="mb-2 text-text-secondary">Tổng lead: {formatNumber(campaign.leadCount ?? 0)}</p>
      {LEAD_STATUS_GROUPS.map(({ code, label, color }) => (
        <div key={code} className="flex items-center gap-2 py-0.5 text-text-secondary">
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="flex-1">{label}</span>
          <span className="font-medium tabular-nums">{formatNumber(leadStatusCount(campaign, code) ?? 0)}</span>
        </div>
      ))}
    </div>
  );
}
