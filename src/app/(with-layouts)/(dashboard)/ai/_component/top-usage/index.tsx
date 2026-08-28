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
import { getTopUsageData } from "@/services/api/ai";
import { useQuery } from "@tanstack/react-query";

import { SKELETON_ROW_COUNT } from "./data";
import { TopUsageSkeletonRow } from "./skeleton";
import type { TopUsageViewModel } from "./types";
import { toTopUsageViewModel } from "./utils";

export default function TopUsage() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["top-usage"],
    queryFn: getTopUsageData,
  });

  const models: TopUsageViewModel[] = rawResponse?.models.map(toTopUsageViewModel) ?? [];

  return (
    <Card>
      {/* Header */}
      <CardHeader className="mb-6">
        <CardTitle>Top Model Usage</CardTitle>
      </CardHeader>

      {/* Table */}
      <div>
        <TableRoot className="w-full rounded-none border-none">
          <TableHeader>
            <TableRow className="[&_th]:border-t">
              <TableHead className="px-5 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Model
              </TableHead>
              <TableHead className="px-5 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Requests
              </TableHead>
              <TableHead className="px-5 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Cost
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                  <TopUsageSkeletonRow key={i} />
                ))
              : models.map((model) => (
                  <TableRow key={model.id} className="[&_td]:border-none">
                    <TableCell className="px-5 py-3.5">
                      <div className="text-sm leading-5 font-medium whitespace-nowrap text-text-primary">
                        {model.modelName}
                      </div>
                      <div className="text-xs leading-4 text-text-tertiary">{model.provider}</div>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                      {model.requests}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-sm leading-5 font-medium whitespace-nowrap text-text-primary">
                      {model.cost}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </TableRoot>
      </div>
    </Card>
  );
}
