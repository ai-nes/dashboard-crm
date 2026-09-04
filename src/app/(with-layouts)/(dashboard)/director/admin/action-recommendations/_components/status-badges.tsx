import { Badge } from "@/components/tailgrids/core/badge";

import type {
  Channel,
  Priority,
  RecommendationStatus,
  RecordStatus,
  RuleStatus,
} from "./types";

const recordStatusCopy: Record<RecordStatus, { label: string; color: "success" | "gray" | "warning" }> = {
  active: { label: "Đang dùng", color: "success" },
  inactive: { label: "Tạm dừng", color: "warning" },
  archived: { label: "Đã lưu trữ", color: "gray" },
};

const ruleStatusCopy: Record<RuleStatus, { label: string; color: "success" | "gray" | "warning" }> = {
  published: { label: "Đã phát hành", color: "success" },
  draft: { label: "Bản nháp", color: "warning" },
  archived: { label: "Đã lưu trữ", color: "gray" },
};

const priorityCopy: Record<Priority, { label: string; color: "error" | "warning" | "gray" }> = {
  high: { label: "Cao", color: "error" },
  medium: { label: "Trung bình", color: "warning" },
  low: { label: "Thấp", color: "gray" },
};

const channelCopy: Record<Channel, string> = {
  NONE: "Không có",
  CALL: "Cuộc gọi",
  EMAIL: "Email",
  MESSAGE: "Tin nhắn",
};

const recommendationStatusCopy: Record<RecommendationStatus, { label: string; color: "primary" | "success" | "warning" }> = {
  new: { label: "Mới", color: "primary" },
  acknowledged: { label: "Đã xem", color: "success" },
  deferred: { label: "Đã để sau", color: "warning" },
};

export function RecordStatusBadge({ status }: { status: RecordStatus }) {
  const copy = recordStatusCopy[status];
  return <Badge color={copy.color}>{copy.label}</Badge>;
}

export function RuleStatusBadge({ status }: { status: RuleStatus }) {
  const copy = ruleStatusCopy[status];
  return <Badge color={copy.color}>{copy.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const copy = priorityCopy[priority];
  return <Badge color={copy.color}>{copy.label}</Badge>;
}

export function RecommendationStatusBadge({ status }: { status: RecommendationStatus }) {
  const copy = recommendationStatusCopy[status];
  return <Badge color={copy.color}>{copy.label}</Badge>;
}

export function ChannelLabel({ channel }: { channel: Channel }) {
  return <span className="text-sm text-text-secondary">{channelCopy[channel]}</span>;
}

