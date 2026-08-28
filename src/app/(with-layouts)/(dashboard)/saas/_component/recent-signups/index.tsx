"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { getRecentSignupsData } from "@/services/api/saas";
import { useQuery } from "@tanstack/react-query";
import { SKELETON_ROW_COUNT } from "./data";
import { RecentSignupSkeletonRow } from "./skeleton";
import { toRecentSignupViewModel } from "./utils";

export default function RecentSignups() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["saas-recent-signups"],
    queryFn: getRecentSignupsData,
  });

  const signups = rawResponse?.data.map(toRecentSignupViewModel) ?? [];

  return (
    <Card>
      <CardHeader className="mb-6">
        <CardTitle>Recent Signups</CardTitle>
      </CardHeader>

      <div>
        <TableRoot className="w-full min-w-125 rounded-none border-none">
          <TableHeader>
            <TableRow className="[&_th]:border-t">
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Rep Name
              </TableHead>
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Status
              </TableHead>
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                MRR
              </TableHead>
              <TableHead className="px-6 py-2.5 text-xs leading-4 font-semibold whitespace-nowrap text-text-secondary">
                Joined
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                  <RecentSignupSkeletonRow key={i} />
                ))
              : signups.map((signup) => (
                  <TableRow key={signup.id} className="[&_td]:border-none">
                    <TableCell className="px-6 py-3.5 text-sm leading-5 font-medium whitespace-nowrap text-text-primary">
                      {signup.repName}
                    </TableCell>
                    <TableCell className="px-6 py-3.5">
                      <Badge color={signup.statusColor} size="sm">
                        {signup.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm leading-5 font-medium whitespace-nowrap text-text-primary">
                      {signup.mrr}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                      {signup.joined}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </TableRoot>
      </div>
    </Card>
  );
}
