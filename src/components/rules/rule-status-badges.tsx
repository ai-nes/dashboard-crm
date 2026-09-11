import { Badge } from "@/components/tailgrids/core/badge";

import type { CrmRuleGateOutcome, CrmRuleStatus } from "@/services/api/rules-config";

const STATUS_LABELS: Record<CrmRuleStatus, string> = {
  draft: "Bản nháp",
  testing: "Đang kiểm thử",
  active: "Đang hoạt động",
  archived: "Đã lưu trữ",
};

const OUTCOME_LABELS: Record<CrmRuleGateOutcome, string> = {
  PASS: "PASS",
  WAIT: "WAIT",
  STOP: "STOP",
  DIRECT: "DIRECT",
  ESCALATE: "ESCALATE",
};

export function CrmRuleStatusBadge({ status }: { status: CrmRuleStatus }) {
  const color = status === "active" ? "success" : status === "archived" ? "gray" : status === "testing" ? "primary" : "warning";
  return <Badge color={color}>{STATUS_LABELS[status]}</Badge>;
}

export function CrmRuleOutcomeBadge({ outcome }: { outcome: CrmRuleGateOutcome }) {
  const color = outcome === "PASS" || outcome === "DIRECT" ? "success" : outcome === "STOP" || outcome === "ESCALATE" ? "error" : "warning";
  return <Badge color={color}>{OUTCOME_LABELS[outcome]}</Badge>;
}
