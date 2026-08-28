"use client";

import type { MarketingTimeRange } from "@/services/api/marketing";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface MarketingTimeRangeContextValue {
  timeRange: MarketingTimeRange;
  setTimeRange: (value: MarketingTimeRange) => void;
}

const MarketingTimeRangeContext = createContext<MarketingTimeRangeContextValue | null>(null);

export function MarketingTimeRangeProvider({ children }: { children: ReactNode }) {
  const [timeRange, setTimeRange] = useState<MarketingTimeRange>("7d");

  const value = useMemo(() => ({ timeRange, setTimeRange }), [timeRange]);

  return (
    <MarketingTimeRangeContext.Provider value={value}>{children}</MarketingTimeRangeContext.Provider>
  );
}

export function useMarketingTimeRange() {
  const context = useContext(MarketingTimeRangeContext);

  if (!context) {
    throw new Error("useMarketingTimeRange must be used within a MarketingTimeRangeProvider");
  }

  return context;
}
