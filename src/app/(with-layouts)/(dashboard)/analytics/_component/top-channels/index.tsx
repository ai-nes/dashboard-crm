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
import { getTopChannelsData } from "@/services/api/analytics";
import { useQuery } from "@tanstack/react-query";
import { TopChannelsSkeletonRow } from "./skeleton";
import { SKELETON_ROW_COUNT, mapTopChannelsResponse } from "./utils";

export default function TopChannels() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["top-channels"],
    queryFn: getTopChannelsData,
  });

  const channels = rawResponse ? mapTopChannelsResponse(rawResponse) : [];

  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Top Channels</CardTitle>
      </CardHeader>

      <div>
        <TableRoot className="w-full min-w-100 rounded-none border-none">
          <TableHeader>
            <TableRow className="[&_th]:border-t">
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Channel
              </TableHead>
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Views
              </TableHead>
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Uniques
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                  <TopChannelsSkeletonRow key={i} />
                ))
              : channels.map((channel) => (
                  <TableRow key={channel.id} className="[&_td]:border-none">
                    <TableCell className="px-6 py-3.5 text-sm leading-5 font-medium whitespace-nowrap text-text-primary">
                      {channel.channelName}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                      {channel.views}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                      {channel.uniques}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </TableRoot>
      </div>
    </Card>
  );
}
