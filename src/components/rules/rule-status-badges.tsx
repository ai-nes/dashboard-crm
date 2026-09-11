import { Badge } from "@/components/tailgrids/core/badge";

import type { CrmRuleGateOutcome, CrmRuleStatus } from "@/services/api/rules-config";

const STATUS_LABELS: Record<CrmRuleStatus, string> = {
  draft: "Bản nháp",
  published: "Đã phát hành",
  archived: "Đã lưu trữ",
};

const OUTCOME_LABELS: Record<CrmRuleGateOutcome, string> = {
  PASS: "PASS",
  WAIT: "WAIT",
  STOP: "STOP",
};

export function CrmRuleStatusBadge({ status }: { status: CrmRuleStatus }) {
  const color = status === "published" ? "success" : status === "archived" ? "gray" : "warning";
  return <Badge color={color}>{STATUS_LABELS[status]}</Badge>;
}

export function CrmRuleOutcomeBadge({ outcome }: { outcome: CrmRuleGateOutcome }) {
  const color = outcome === "PASS" ? "success" : outcome === "STOP" ? "error" : "warning";
  return <Badge color={color}>{OUTCOME_LABELS[outcome]}</Badge>;
}
