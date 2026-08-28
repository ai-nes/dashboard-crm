"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { getConversionFunnelData } from "@/services/api/marketing";
import { useQuery } from "@tanstack/react-query";
import ConversionFunnelSkeleton from "./skeleton";
import { mapConversionFunnelResponse } from "./utils";

const STAGE_OPACITY = ["opacity-100", "opacity-80", "opacity-60", "opacity-40"];

export default function ConversionFunnel() {
  const { data, isLoading } = useQuery({
    queryKey: ["conversion-funnel"],
    queryFn: getConversionFunnelData,
  });

  if (isLoading || !data) {
    return <ConversionFunnelSkeleton />;
  }

  const stages = mapConversionFunnelResponse(data);

  return (
    <Card>
      {/* Header */}
      <CardHeader className="mb-6">
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>

      {/* Funnel stages */}
      <CardContent className="flex flex-col gap-3 p-0">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center gap-4">
            <span className="w-20 shrink-0 text-sm leading-5 font-medium text-text-tertiary md:w-24">
              {stage.label}
            </span>

            <div className="flex h-10 flex-1 items-center">
              <div
                className={`flex h-full items-center justify-center rounded-md bg-brand-500 ${STAGE_OPACITY[index] ?? "opacity-40"}`}
                style={{ width: `${Math.max(stage.percentOfTop, 8)}%` }}
              >
                <span className="text-sm font-semibold text-white-100">{stage.count}</span>
              </div>
            </div>

            <span className="w-12 shrink-0 text-right text-sm leading-5 font-medium text-text-secondary">
              {stage.dropOffPercent ?? "—"}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
