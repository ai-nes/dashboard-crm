"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { getMarketNewsData } from "@/services/api/stocks";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MarketNewsRowSkeleton } from "./skeleton";
import { SKELETON_ROW_COUNT, mapMarketNewsItem } from "./utils";

export default function MarketNews() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["market-news"],
    queryFn: getMarketNewsData,
  });

  const news = rawResponse?.data.map(mapMarketNewsItem) ?? [];

  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Market News</CardTitle>
        <Link href="#" className="text-sm font-medium text-primary-500 hover:underline">
          View All
        </Link>
      </CardHeader>

      <CardContent className="flex flex-col p-0">
        {isLoading
          ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <MarketNewsRowSkeleton key={i} />
            ))
          : news.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="flex items-center justify-between gap-4 border-b border-border-primary py-3 first:pt-0 last:border-0 last:pb-0 hover:text-primary-500"
              >
                <p className="text-sm leading-5 font-medium text-text-primary">
                  {item.headline}
                </p>
                <span className="shrink-0 text-xs leading-4 text-text-tertiary">
                  {item.source} · {item.time}
                </span>
              </Link>
            ))}
      </CardContent>
    </Card>
  );
}
