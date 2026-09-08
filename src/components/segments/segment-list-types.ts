export type SegmentType = "AUTOMATIC" | "MANUAL";

export interface SegmentListItem {
  id: string;
  name: string;
  size: number;
  type: SegmentType;
  updatedAt: string;
  creator: string;
  usedIn: number;
  description: string;
}

export const SEGMENT_TYPE_LABELS: Record<SegmentType, string> = {
  AUTOMATIC: "Tự động",
  MANUAL: "Thủ công",
};
