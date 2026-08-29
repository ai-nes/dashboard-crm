import CampaignIntelligenceDashboard from "./_component/campaign-intelligence/campaign-intelligence-dashboard";
import { MarketingTimeRangeProvider } from "./_component/time-range-context";

export default function MarketingPage() {
  return (
    <MarketingTimeRangeProvider>
      <div className="mt-6 space-y-5">
        <div className="px-2 lg:px-5"><CampaignIntelligenceDashboard /></div>
      </div>
    </MarketingTimeRangeProvider>
  );
}
