import type { TopContentRawResponse } from "@/services/api/analytics";

export type { TopContentRawResponse };

export interface TopContentViewModel {
  id: string;
  urlPath: string;
  views: string;
  uniques: string;
}
