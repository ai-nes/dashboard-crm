import type { TopChannelsRawResponse } from "@/services/api/analytics";
import { formatNumber } from "@/utils/format-number";

import type { TopChannelViewModel } from "./types";

export const SKELETON_ROW_COUNT = 5;

export function mapTopChannelsResponse(response: TopChannelsRawResponse): TopChannelViewModel[] {
  return response.channels.map((channel) => ({
    id: channel.id,
    channelName: channel.channel_name,
    views: formatNumber({ value: channel.views_count }),
    uniques: formatNumber({ value: channel.unique_views_count }),
  }));
}
