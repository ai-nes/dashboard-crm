import mockData from "./mock-data.json";
import { asMockFixture } from "../mock-fixture";
import type { CampaignIntelligenceResponse } from "./types";

export const campaignIntelligenceMock = asMockFixture<CampaignIntelligenceResponse>(mockData.campaignIntelligenceMock);
