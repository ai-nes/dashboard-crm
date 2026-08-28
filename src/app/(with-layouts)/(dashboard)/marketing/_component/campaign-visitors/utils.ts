import type { CampaignVisitorsRawResponse } from "@/services/api/marketing";

import type { CampaignVisitorsViewModel } from "./types";

export function mapCampaignVisitorsResponse(
  response: CampaignVisitorsRawResponse,
): CampaignVisitorsViewModel {
  return {
    data: response.data.map((point) => ({
      name: point.label,
      email: point.email,
      social: point.social,
      search: point.search,
      referral: point.referral,
    })),
    summary: {
      totalVisitors: response.summary.total_visitors,
      deltaPercent: response.summary.delta_percent,
    },
  };
}
