const DEFAULT_CAMPAIGN_LIST_PATH = "/lead-sale/campaigns";

export function getCampaignListPath(
  roles: readonly string[] | null | undefined,
): string {
  if (roles?.includes("CTV Sale")) return "/ctv-sale/campaigns";
  if (roles?.includes("Sale")) return "/sale/campaigns";
  return DEFAULT_CAMPAIGN_LIST_PATH;
}

export function getCampaignDetailPath(
  listPath: string,
  campaignCode: string,
): string {
  return `${listPath}/${encodeURIComponent(campaignCode)}`;
}
