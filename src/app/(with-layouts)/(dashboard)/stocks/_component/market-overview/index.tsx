"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { getMarketOverviewData } from "@/services/api/stocks";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MarketOverviewSkeletonRow } from "./skeleton";
import { SKELETON_ROW_COUNT, mapMarketOverviewItem } from "./utils";

export default function MarketOverview() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["market-overview"],
    queryFn: getMarketOverviewData,
  });

  const items = rawResponse?.data.map(mapMarketOverviewItem) ?? [];

  return (
    <Card className="p-0">
      <CardHeader className="p-5">
        <CardTitle>Market Overview</CardTitle>
        <Link href="#" className="text-sm font-medium text-primary-500 hover:underline">
          View All
        </Link>
      </CardHeader>

      <TableRoot className="w-full rounded-none border-none">
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>24H%</TableHead>
            <TableHead>Market Cap</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                <MarketOverviewSkeletonRow key={i} />
              ))
            : items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap text-text-primary">
                    {item.symbol}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-primary">
                    {item.price}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {item.volume}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "whitespace-nowrap",
                      item.isPositive ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {item.changePercent}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-text-secondary">
                    {item.marketCap}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </TableRoot>
    </Card>
  );
}
