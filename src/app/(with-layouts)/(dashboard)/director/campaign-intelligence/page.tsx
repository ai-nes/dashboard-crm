import CampaignIntelligenceDashboard from "../../marketing/_component/campaign-intelligence/campaign-intelligence-dashboard";
import { MarketingTimeRangeProvider } from "../../marketing/_component/time-range-context";

export default function DirectorCampaignIntelligencePage() {
  return (
    <MarketingTimeRangeProvider>
      <div className="mt-6 space-y-5">
        <div className="px-2 lg:px-5">
          <CampaignIntelligenceDashboard />
        </div>
      </div>
    </MarketingTimeRangeProvider>
  );
}
