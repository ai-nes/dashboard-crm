import { Button } from "@/components/tailgrids/core/button";
import TopChannels from "./_component/top-channels";
import TopContent from "./_component/top-content";
import TopCountries from "./_component/top-countries";
import UsedDevices from "./_component/used-devices";
import VisitorsAnalytics from "./_component/visitors-analytics";

export default function Analytics() {
  return (
    <div className="mt-6 space-y-5">
      {/* Header Section */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-2 lg:px-6">
        <div>
          <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Analytics</h1>
          <p className="text-sm leading-5 text-text-tertiary">
            Analyze trends, track growth, and make data-driven decisions.
          </p>
        </div>

        <Button variant="primary" size="md" className="px-3.5 text-sm">
          Export
        </Button>
      </div>

      <div className="space-y-5 px-2 lg:px-5">
        <VisitorsAnalytics />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <UsedDevices />
          <TopCountries />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TopContent />
          <TopChannels />
        </div>
      </div>
    </div>
  );
}
