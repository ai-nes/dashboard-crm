"use client";

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
import { getAiAgentsData } from "@/services/api/ai";
import { useQuery } from "@tanstack/react-query";

import { SKELETON_ROW_COUNT } from "./data";
import { AgentSkeletonRow } from "./skeleton";
import type { AiAgentViewModel } from "./types";
import { getSuccessRateColor, toAiAgentViewModel } from "./utils";

export default function AiAgents() {
  const { data: rawResponse, isLoading } = useQuery({
    queryKey: ["ai-agents"],
    queryFn: getAiAgentsData,
  });

  const agents: AiAgentViewModel[] = rawResponse?.agents.map(toAiAgentViewModel) ?? [];

  return (
    <Card>
      {/* Header */}
      <CardHeader className="mb-6">
        <CardTitle>AI Agents</CardTitle>
      </CardHeader>

      {/* Table */}
      <div>
        <TableRoot className="w-full rounded-none border-none">
          <TableHeader>
            <TableRow className="[&_th]:border-t">
              <TableHead className="px-5 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Name
              </TableHead>
              <TableHead className="px-5 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Status
              </TableHead>
              <TableHead className="px-5 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Requests
              </TableHead>
              <TableHead className="px-5 py-2.5 text-xs leading-4 font-semibold text-text-secondary">
                Success Rate
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                  <AgentSkeletonRow key={i} />
                ))
              : agents.map((agent) => (
                  <TableRow key={agent.id} className="[&_td]:border-none">
                    <TableCell className="px-5 py-3.5">
                      <div className="text-sm leading-5 font-medium whitespace-nowrap text-text-primary">
                        {agent.name}
                      </div>
                      <div className="text-xs leading-4 whitespace-nowrap text-text-tertiary">
                        {agent.description}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Badge color={agent.statusColor} size="sm">
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-sm leading-5 whitespace-nowrap text-text-secondary">
                      {agent.requests}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Progress
                        progress={agent.successRate}
                        withLabel
                        barColor={getSuccessRateColor(agent.successRate)}
                        className="max-w-32"
                      />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </TableRoot>
      </div>
    </Card>
  );
}
