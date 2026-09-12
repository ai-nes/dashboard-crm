"use client";

import { useEffect, useState } from "react";
import {
  DirectorMarketApiError,
  getDirectorMarketIntelligence,
} from "@/services/api/market-intelligence";
import type { DirectorMarketOverview } from "@/services/api/market-intelligence";
import MarketIntelligenceDashboard from "./_components/market-intelligence-dashboard";
import MarketIntelligenceSkeleton from "./_components/market-intelligence-skeleton";

const REQUEST = {
  period: "30d" as const,
  region: "all" as const,
  metric: "opportunity" as const,
  includeSchools: true,
  schoolLimit: 20,
};

export default function MarketIntelligencePageClient() {
  const [overview, setOverview] = useState<DirectorMarketOverview>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getDirectorMarketIntelligence(REQUEST)
      .then((data) => {
        if (cancelled) return;
        setOverview(data);
        setError(undefined);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(marketErrorMessage(requestError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <MarketIntelligenceSkeleton />;
  }

  return <MarketIntelligenceDashboard overview={overview} error={error} />;
}

function marketErrorMessage(error: unknown): string {
  if (error instanceof DirectorMarketApiError && error.status === 401) return "Phiên đăng nhập không còn hợp lệ.";
  if (error instanceof DirectorMarketApiError && error.status === 403) return "Bạn không có quyền xem dữ liệu thị trường.";
  if (error instanceof DirectorMarketApiError && error.status >= 500) return "Nguồn dữ liệu thị trường hiện chưa sẵn sàng.";
  return "Không thể tải dữ liệu thị trường từ CRM.";
}
