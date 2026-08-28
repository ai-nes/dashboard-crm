"use client";

import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Progress } from "@/components/tailgrids/core/progress";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { getLeadsReportData } from "@/services/api/crm";
import { useQuery } from "@tanstack/react-query";
import { LeadsReportSkeletonRow } from "./skeleton";
import type { PerformanceLevel } from "./types";
import { PERFORMANCE_BAR_COLOR, SKELETON_ROW_COUNT, toSalesRepViewModel } from "./utils";

const PERFORMANCE_BADGE_COLOR: Record<PerformanceLevel, "success" | "primary" | "error"> = {
  excellent: "success",
  good: "primary",
  "at-risk": "error",
};

const PERFORMANCE_BADGE_LABEL: Record<PerformanceLevel, string> = {
  excellent: "Excellent",
  good: "On Track",
  "at-risk": "At Risk",
};

export default function LeadsReport() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["crm-leads-report"],
    queryFn: getLeadsReportData,
  });

  const reps = rawResponse?.reps.map(toSalesRepViewModel) ?? [];

  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Leads Report</CardTitle>
      </CardHeader>

      <div>
        <TableRoot className="w-full min-w-140 rounded-none border-none">
          <TableHeader>
            <TableRow className="[&_th]:border-t">
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Rep Name
              </TableHead>
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Deals Closed
              </TableHead>
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Revenue
              </TableHead>
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Performance
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                  <LeadsReportSkeletonRow key={i} />
                ))
              : reps.map((rep) => (
                  <TableRow key={rep.id} className="[&_td]:border-none">
                    <TableCell className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar size="xs">
                          <AvatarFallback className="text-xs">
                            {rep.avatarInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm leading-5 font-medium whitespace-nowrap text-text-primary">
                          {rep.repName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm leading-5 text-text-secondary">
                      {rep.dealsClosed}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm leading-5 font-medium whitespace-nowrap text-text-primary">
                      {rep.revenue}
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Progress
                          progress={Math.min(rep.performancePercent, 100)}
                          barColor={PERFORMANCE_BAR_COLOR[rep.performanceLevel]}
                          className="max-w-24"
                        />
                        <Badge color={PERFORMANCE_BADGE_COLOR[rep.performanceLevel]} size="sm">
                          {PERFORMANCE_BADGE_LABEL[rep.performanceLevel]}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </TableRoot>
      </div>
    </Card>
  );
}
