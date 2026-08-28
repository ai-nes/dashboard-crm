import { formatNumber } from "@/utils/format-number";
import type { AudienceInsightsRawResponse } from "@/services/api/marketing";

import type { AudienceSegmentViewModel } from "./types";

export function mapAudienceInsightsResponse(
  response: AudienceInsightsRawResponse,
): AudienceSegmentViewModel[] {
  return response.segments.map((segment) => ({
    id: segment.id,
    label: segment.segment_label,
    value: formatNumber({ value: segment.visitor_count }),
    percentage: segment.percentage,
  }));
}
