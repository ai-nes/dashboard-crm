import type {
  SegmentRecord,
  SegmentStatus as ApiSegmentStatus,
} from "@/services/api/segments";

export type SegmentStatus = ApiSegmentStatus;
export type SegmentType = "dynamic" | "static";

export interface SegmentListItem {
  /** Frappe document name is the stable segment identifier. */
  id: string;
  segmentCode: string;
  name: string;
  size: number;
  status: SegmentStatus;
  updatedAt: string;
  createdAt: string;
  creator: string;
  usedIn: number;
  description: string;
  revision: number;
  category?: string;
  segmentType?: SegmentType;
}

export function toSegmentListItem(
  segment: SegmentRecord,
  sizeOverride?: number,
): SegmentListItem {
  return {
    id: segment.name,
    segmentCode: segment.segment_code || segment.name,
    name: segment.title || segment.name,
    size: sizeOverride ?? segment.member_count ?? 0,
    status: segment.status,
    updatedAt: segment.modified || segment.creation || "",
    createdAt: segment.creation || segment.modified || "",
    creator: segment.owner || segment.responsible_user || "—",
    usedIn: 0,
    description: segment.purpose || "",
    revision: segment.revision || 0,
    category: segment.category || undefined,
    segmentType: segment.segment_type,
  };
}

export const SEGMENT_STATUS_LABELS: Record<SegmentStatus, string> = {
  draft: "Bản nháp",
  active: "Đang diễn ra",
  inactive: "Không hoạt động",
  archive: "Lưu trữ",
};

export const SEGMENT_STATUS_BADGE_COLORS: Record<
  SegmentStatus,
  "gray" | "success" | "warning" | "violet"
> = {
  draft: "warning",
  active: "success",
  inactive: "gray",
  archive: "violet",
};

export const SEGMENT_STATUS_SELECT_STYLES: Record<SegmentStatus, string> = {
  draft:
    "border-transparent bg-badge-warning-background text-badge-warning-text hover:bg-badge-warning-background",
  active:
    "border-transparent bg-badge-success-background text-badge-success-text hover:bg-badge-success-background",
  inactive:
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
    value: "inactive",
    label: SEGMENT_STATUS_LABELS.inactive,
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
  { id: "inactive", label: SEGMENT_STATUS_LABELS.inactive },
  { id: "archive", label: SEGMENT_STATUS_LABELS.archive },
  { id: "draft", label: SEGMENT_STATUS_LABELS.draft },
];
