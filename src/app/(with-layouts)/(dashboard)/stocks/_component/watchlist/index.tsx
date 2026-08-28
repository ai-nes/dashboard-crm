"use client";

import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { getWatchlistData } from "@/services/api/stocks";
import { cn } from "@/utils/cn";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from "@/utils/icon";
import { useQuery } from "@tanstack/react-query";
import { WatchlistRowSkeleton } from "./skeleton";
import { SKELETON_ROW_COUNT, mapWatchlistItem } from "./utils";

export default function Watchlist() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: getWatchlistData,
  });

  const items = rawResponse?.data.map(mapWatchlistItem) ?? [];

  return (
    <Card>
      {/* Header */}
      <CardHeader className="mb-6">
        <CardTitle>My Watchlist</CardTitle>

        <Button appearance="outline" size="sm">
          <PlusIcon className="size-4" />
          Add Watchlist
        </Button>
      </CardHeader>

      {/* Watchlist */}
      <CardContent className="flex flex-col p-0">
        {isLoading
          ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <WatchlistRowSkeleton key={i} />
            ))
          : items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-border-primary py-3 first:pt-0 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{item.symbol.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm leading-5 font-medium text-text-primary">
                      {item.symbol}
                    </p>
                    <small className="block text-xs leading-4 text-text-tertiary">
                      {item.companyName}
                    </small>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm leading-5 font-medium text-text-primary">{item.price}</p>
                  <p
                    className={cn(
                      "mt-1 flex items-center justify-end gap-1 text-xs leading-4",
                      item.isPositive ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {item.changePercent}
                    {item.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  </p>
                </div>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
