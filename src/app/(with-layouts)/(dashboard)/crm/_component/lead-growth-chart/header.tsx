import { CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { cn } from "@/utils/cn";
import { ArrowDownIcon, ArrowUpIcon } from "@/utils/icon";
import { LeadGrowthStatSkeleton } from "./skeleton";
import type { LeadGrowthGranularity } from "@/services/api/crm";

import type { LeadGrowthViewModel } from "./types";

type HeaderSectionProps = {
  isLoading: boolean;
  chartData?: LeadGrowthViewModel;
  stats: Array<{
    id: string;
    label: string;
    value: string;
    delta: string;
    isPositive: boolean;
    dotClassName: string;
  }>;
  granularity: LeadGrowthGranularity;
  setGranularity: (value: LeadGrowthGranularity) => void;
};

export default function HeaderSection({
  isLoading,
  stats,
  chartData,
  granularity,
  setGranularity,
}: HeaderSectionProps) {
  return (
    <div className="mb-6 flex flex-col gap-6">
      <CardHeader>
        <CardTitle>Lead Growth &amp; Conversion</CardTitle>

        <Select
          onChange={(value) => setGranularity(value as LeadGrowthGranularity)}
          value={granularity}
          defaultValue="7d"
          aria-label="Select date range"
        >
          <SelectTrigger size="sm">
            <SelectValue />
            <SelectIndicator className="text-button-primary-outline-text" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem textValue="7 days" id="7d">
              Last 7 Days
            </SelectItem>
            <SelectItem textValue="30 days" id="30d">
              Last 30 Days
            </SelectItem>
            <SelectItem textValue="90 days" id="90d">
              Last 90 Days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <div className="flex flex-col gap-8 sm:flex-row">
        {isLoading || !chartData ? (
          <>
            <LeadGrowthStatSkeleton />
            <LeadGrowthStatSkeleton />
          </>
        ) : (
          stats.map((stat) => (
            <div key={stat.id}>
              <div className="mb-2 flex items-center gap-3">
                <span className={cn("size-2 rounded-xs", stat.dotClassName)} />
                <span className="text-sm leading-5 font-medium text-text-secondary">
                  {stat.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-text-primary md:text-2xl md:leading-8">
                  {stat.value}
                </h3>
                <p className="flex items-center gap-1 text-sm leading-5 text-text-secondary">
                  <span
                    className={cn(
                      "font-medium",
                      stat.isPositive ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {stat.delta}
                  </span>
                  <span
                    className={cn("size-4", stat.isPositive ? "text-green-600" : "text-red-600")}
                  >
                    {stat.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  </span>
                  <span>vs previous period</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
