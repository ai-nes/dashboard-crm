import { ChevronLeft } from "@tailgrids/icons";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/tailgrids/core/badge";
import { formatDate } from "@/utils/format-date";

import { getChannelTypeLabel, type ChannelTypeOption } from "./channel-types";
import { campaignModeColor, campaignModeLabel, campaignStatusColor, campaignStatusLabel } from "./mappings";
import type { CampaignListItem } from "./types";

export default function CampaignDetailHeader({
  campaign,
  channelTypes,
  backHref = "/lead-sale/campaigns",
}: {
  campaign: CampaignListItem;
  channelTypes: readonly ChannelTypeOption[];
  backHref?: string;
}) {
  return (
    <header className="rounded-xl border border-card-border bg-card-background p-5 lg:p-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-xs font-medium text-text-tertiary hover:text-text-primary"
      >
        <ChevronLeft size={14} aria-hidden="true" />
        Quay lại danh sách chiến dịch
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge color="primary">{campaign.code}</Badge>
        <Badge color={campaignStatusColor[campaign.status]}>{campaignStatusLabel[campaign.status]}</Badge>
        <Badge color={campaignModeColor[campaign.mode]}>{campaignModeLabel[campaign.mode]}</Badge>
      </div>

      <h1 className="mt-3 text-balance text-[28px] leading-8 font-semibold tracking-[-0.4px] text-text-primary">
        {campaign.name}
      </h1>
      <p className="mt-2 text-sm leading-6 text-text-secondary">Kỳ tuyển sinh {campaign.admissionYear}</p>

      <div className="mt-4 grid divide-y divide-card-border border-t border-card-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <HeaderFact label="Thời gian" value={`${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}`} />
        <HeaderFact
          label="Loại kênh"
          value={campaign.channelType ? getChannelTypeLabel(channelTypes, campaign.channelType) : "-"}
        />
        <HeaderFact
          label="Channel URL"
          value={
            campaign.channelUrl ? (
              <a
                href={campaign.channelUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate text-primary-600 underline-offset-4 hover:underline"
                title={campaign.channelUrl}
              >
                {campaign.channelUrl}
              </a>
            ) : (
              "-"
            )
          }
        />
      </div>
    </header>
  );
}

function HeaderFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 px-3 py-2.5 first:pl-0">
      <p className="text-[11px] text-text-tertiary">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}
