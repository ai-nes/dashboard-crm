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
import { getTopContentData } from "@/services/api/analytics";
import { useQuery } from "@tanstack/react-query";
import { TopContentSkeletonRow } from "./skeleton";
import { SKELETON_ROW_COUNT, mapTopContentResponse } from "./utils";

export default function TopContent() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["top-content"],
    queryFn: getTopContentData,
  });

  const pages = rawResponse ? mapTopContentResponse(rawResponse) : [];

  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Top Content</CardTitle>
      </CardHeader>

      <div>
        <TableRoot className="w-full min-w-100 rounded-none border-none">
          <TableHeader>
            <TableRow className="[&_th]:border-t">
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Page
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
                  <TopContentSkeletonRow key={i} />
                ))
              : pages.map((page) => (
                  <TableRow key={page.id} className="[&_td]:border-none">
                    <TableCell className="px-6 py-3.5 text-sm leading-5 font-medium whitespace-nowrap text-text-primary">
                      {page.urlPath}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                      {page.views}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                      {page.uniques}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </TableRoot>
      </div>
    </Card>
  );
}
