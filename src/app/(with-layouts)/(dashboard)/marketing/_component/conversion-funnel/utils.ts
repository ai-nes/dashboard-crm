import { formatNumber } from "@/utils/format-number";
import type { ConversionFunnelRawResponse } from "@/services/api/marketing";

import type { FunnelStageViewModel } from "./types";

export function mapConversionFunnelResponse(
  response: ConversionFunnelRawResponse,
): FunnelStageViewModel[] {
  return response.stages.map((stage, index) => {
    const previousStage = response.stages[index - 1];
    const dropOffPercent =
      previousStage && previousStage.count > 0
        ? `${((stage.count / previousStage.count) * 100).toFixed(1)}%`
        : null;

    return {
      id: stage.id,
      label: stage.label,
      count: formatNumber({ value: stage.count }),
      percentOfTop: stage.percent_of_top,
      dropOffPercent,
    };
  });
}
