"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";

import type { LeadSaleDetailId, LeadSaleStageAnalysis } from "./mock-data";
import StageInterventions from "./stage-interventions";
import StagePipelineOverview from "./stage-pipeline-overview";

interface StageAnalysisProps {
  stages: LeadSaleStageAnalysis[];
  onOpenDetail: (detailId: LeadSaleDetailId) => void;
}

export default function StageAnalysis({ stages, onOpenDetail }: StageAnalysisProps) {
  const conversionStages = stages.filter((stage) => stage.nextStepConversion !== null);
  const lowestConversion = conversionStages.reduce<LeadSaleStageAnalysis | undefined>(
    (lowest, stage) => (!lowest || stage.nextStepConversion! < lowest.nextStepConversion!) ? stage : lowest,
    undefined,
  );
  const maxVolume = Math.max(...stages.map((stage) => stage.volume), 0);

  return (
    <Card className="min-w-0 overflow-hidden p-5 sm:p-6">
      <CardHeader className="items-start">
        <div>
          <CardTitle>Tổng quan phễu tuyển sinh</CardTitle>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-text-tertiary">
            Quy mô, tỷ lệ chuyển bước và các điểm cần xử lý theo giai đoạn.
          </p>
        </div>
      </CardHeader>

      <div className="mt-5">
        <StagePipelineOverview
          stages={stages}
          maxVolume={maxVolume}
          lowestConversionId={lowestConversion?.id}
          onOpenDetail={onOpenDetail}
        />
        <StageInterventions
          stages={stages}
          lowestConversionId={lowestConversion?.id}
          onOpenDetail={onOpenDetail}
        />
      </div>
    </Card>
  );
}
