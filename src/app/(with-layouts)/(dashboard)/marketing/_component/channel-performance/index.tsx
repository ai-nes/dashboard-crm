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
import { getChannelPerformanceData } from "@/services/api/marketing";
import { useQuery } from "@tanstack/react-query";
import { SKELETON_ROW_COUNT } from "./data";
import { ChannelPerformanceSkeletonRow } from "./skeleton";
import { toChannelPerformanceViewModel } from "./utils";

export default function ChannelPerformance() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["channel-performance"],
    queryFn: getChannelPerformanceData,
  });

  const channels = rawResponse?.channels.map(toChannelPerformanceViewModel) ?? [];

  return (
    <Card>
      {/* Header */}
      <CardHeader className="mb-6">
        <CardTitle>Channel Performance</CardTitle>
      </CardHeader>

      {/* Table */}
      <div>
        <TableRoot className="w-full min-w-150 rounded-none border-none">
          <TableHeader>
            <TableRow className="[&_th]:border-t">
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Channel
              </TableHead>
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold whitespace-nowrap text-text-secondary">
                Spend
              </TableHead>
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Click
              </TableHead>
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold whitespace-nowrap text-text-secondary">
                Conv. %
              </TableHead>
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Revenue
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                  <ChannelPerformanceSkeletonRow key={i} />
                ))
              : channels.map((channel) => (
                  <TableRow key={channel.id} className="[&_td]:border-none">
                    <TableCell className="px-6 py-3.5 text-sm leading-5 font-medium whitespace-nowrap text-text-primary">
                      {channel.channel}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                      {channel.spend}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                      {channel.clicks}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                      {channel.conversionRate}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm leading-5 font-medium whitespace-nowrap text-text-primary">
                      {channel.revenue}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </TableRoot>
      </div>
    </Card>
  );
}
