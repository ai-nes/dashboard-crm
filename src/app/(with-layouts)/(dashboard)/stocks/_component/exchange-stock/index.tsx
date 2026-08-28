"use client";

import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { TabContent, TabList, TabRoot, TabTrigger } from "@/components/tailgrids/core/tabs";
import { getExchangeStockData } from "@/services/api/stocks";
import { cn } from "@/utils/cn";
import { ArrowDownIcon, ArrowUpIcon } from "@/utils/icon";
import { useQuery } from "@tanstack/react-query";
import { ExchangeStockRowSkeleton } from "./skeleton";
import type { ExchangeStockItemViewModel } from "./types";
import { CATEGORY_TABS, SKELETON_ROW_COUNT, mapExchangeStockItem } from "./utils";

function ExchangeStockRow({ item }: { item: ExchangeStockItemViewModel }) {
  return (
    <div className="flex items-center justify-between border-b border-border-primary py-3 first:pt-0 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{item.symbol.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm leading-5 font-medium text-text-primary">{item.symbol}</p>
          <p
            className={cn(
              "flex items-center gap-1 text-xs leading-4",
              item.isPositive ? "text-green-600" : "text-red-600",
            )}
          >
            {item.price}
            <span>{item.changePercent}</span>
            {item.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="success" appearance="outline" size="xs">
          Buy
        </Button>
        <Button variant="danger" appearance="outline" size="xs">
          Short
        </Button>
      </div>
    </div>
  );
}

export default function ExchangeStock() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["exchange-stock"],
    queryFn: getExchangeStockData,
  });

  return (
    <Card className="p-0">
      <CardHeader className="p-5 pb-0">
        <CardTitle>Exchange Stock</CardTitle>
      </CardHeader>

      <TabRoot defaultValue="trading" className="rounded-none border-none">
        <TabList className="px-5">
          {CATEGORY_TABS.map((tab) => (
            <TabTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabTrigger>
          ))}
        </TabList>

        {CATEGORY_TABS.map((tab) => {
          const items = rawResponse?.categories[tab.id].map(mapExchangeStockItem) ?? [];

          return (
            <TabContent key={tab.id} value={tab.id}>
              {isLoading
                ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                    <ExchangeStockRowSkeleton key={i} />
                  ))
                : items.map((item) => <ExchangeStockRow key={item.id} item={item} />)}
            </TabContent>
          );
        })}
      </TabRoot>
    </Card>
  );
}
