import type { TopContentRawResponse } from "@/services/api/analytics";
import { formatNumber } from "@/utils/format-number";

import type { TopContentViewModel } from "./types";

export const SKELETON_ROW_COUNT = 6;

export function mapTopContentResponse(response: TopContentRawResponse): TopContentViewModel[] {
  return response.pages.map((page) => ({
    id: page.id,
    urlPath: page.url_path,
    views: formatNumber({ value: page.views_count }),
    uniques: formatNumber({ value: page.unique_views_count }),
  }));
}
