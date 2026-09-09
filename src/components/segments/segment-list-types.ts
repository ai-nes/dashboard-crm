export type SegmentStatus = "draft" | "active" | "notactive" | "archive";

export interface SegmentListItem {
  id: string;
  /** Stable display code: SEG- followed by a six-digit sequence. */
  code: string;
  name: string;
  size: number;
  status: SegmentStatus;
  updatedAt: string;
  creator: string;
  usedIn: number;
  description: string;
}

export const SEGMENT_STATUS_LABELS: Record<SegmentStatus, string> = {
  draft: "Bản nháp",
  active: "Đang diễn ra",
  notactive: "Không hoạt động",
  archive: "Lưu trữ",
};

export const SEGMENT_STATUS_BADGE_COLORS: Record<
  SegmentStatus,
  "gray" | "success" | "warning" | "violet"
> = {
  draft: "warning",
  active: "success",
  notactive: "gray",
  archive: "violet",
};

export const SEGMENT_STATUS_SELECT_STYLES: Record<SegmentStatus, string> = {
  draft:
    "border-transparent bg-badge-warning-background text-badge-warning-text hover:bg-badge-warning-background",
  active:
    "border-transparent bg-badge-success-background text-badge-success-text hover:bg-badge-success-background",
  notactive:
    "border-transparent bg-badge-neutral-background text-badge-neutral-text hover:bg-badge-neutral-background",
  archive:
    "border-transparent bg-badge-violet-background text-badge-violet-text hover:bg-badge-violet-background",
};

export const SEGMENT_STATUS_OPTIONS: Array<{
  value: SegmentStatus;
  label: string;
  description: string;
}> = [
  {
    value: "draft",
    label: SEGMENT_STATUS_LABELS.draft,
    description: "Segment đang được chuẩn bị và chưa hoạt động.",
  },
  {
    value: "active",
    label: SEGMENT_STATUS_LABELS.active,
    description: "Segment đang được sử dụng trong hệ thống.",
  },
  {
    value: "notactive",
    label: SEGMENT_STATUS_LABELS.notactive,
    description: "Segment tạm dừng và chưa được sử dụng.",
  },
  {
    value: "archive",
    label: SEGMENT_STATUS_LABELS.archive,
    description: "Segment đã được lưu trữ để tham khảo.",
  },
];

export const SEGMENT_STATUS_FILTER_OPTIONS = [
  { id: "ALL", label: "Tất cả" },
  { id: "active", label: SEGMENT_STATUS_LABELS.active },
  { id: "notactive", label: SEGMENT_STATUS_LABELS.notactive },
  { id: "archive", label: SEGMENT_STATUS_LABELS.archive },
  { id: "draft", label: SEGMENT_STATUS_LABELS.draft },
];
