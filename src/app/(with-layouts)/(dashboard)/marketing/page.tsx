import AudienceInsights from "./_component/audience-insights";
import CampaignVisitors from "./_component/campaign-visitors";
import ChannelPerformance from "./_component/channel-performance";
import ConversionFunnel from "./_component/conversion-funnel";
import PageHeader from "./_component/page-header";
import RecentActivities from "./_component/recent-activities";
import { MarketingTimeRangeProvider } from "./_component/time-range-context";
import TotalImpression from "./_component/total-impression";

export default function MarketingPage() {
  return (
    <MarketingTimeRangeProvider>
      <div className="mt-6 space-y-5">
        {/* Header Section */}
        <PageHeader />

        <div className="space-y-5 px-2 lg:px-5">
          <TotalImpression />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-[2fr_1fr]">
            <CampaignVisitors />
            <AudienceInsights />
          </div>

          <ConversionFunnel />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-[2fr_1fr]">
            <ChannelPerformance />
            <RecentActivities />
          </div>
        </div>
      </div>
    </MarketingTimeRangeProvider>
  );
}
