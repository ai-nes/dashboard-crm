import type { TopChannelsRawResponse } from "@/services/api/analytics";

export type { TopChannelsRawResponse };

export interface TopChannelViewModel {
  id: string;
  channelName: string;
  views: string;
  uniques: string;
}
