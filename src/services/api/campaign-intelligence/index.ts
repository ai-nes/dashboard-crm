import { delay } from "@/utils/delay";
import { campaignIntelligenceMock } from "./data";
import type { CampaignIntelligenceResponse } from "./types";

export type * from "./types";

export async function getCampaignIntelligence(): Promise<CampaignIntelligenceResponse> {
  await delay(550);
  return campaignIntelligenceMock;
}
