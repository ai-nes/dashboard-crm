import type {
  AnalysisClaimKind,
  AnalysisReport,
  AnalysisReportItem,
  AnalysisRunStage,
  AnalysisRunStatus,
} from "@/services/api/analysis-runs";

/**
 * Pick the most reliable report item while preserving response order on ties.
 * Items without a confidence score remain a safe fallback when no scored item
 * exists, so a valid response is never hidden only because confidence is null.
 */
export function getHighestConfidenceReportItem(
  items: AnalysisReportItem[],
): AnalysisReportItem | null {
  if (items.length === 0) return null;

  return items.reduce((selected, item) => {
    if (selected === null) return item;

    const selectedConfidence = selected.confidence ?? -1;
    const itemConfidence = item.confidence ?? -1;
    return itemConfidence > selectedConfidence ? item : selected;
  }, null as AnalysisReportItem | null);
}

export function getRichReport(
  stages: AnalysisRunStage[],
): AnalysisReport | null {
  return stages.find((stage) => stage.report)?.report ?? null;
}

const TERMINAL_REASON_LABELS: Record<string, string> = {
  evidence_access_denied: "quyền truy cập dữ liệu nguồn bị từ chối",
  source_revision_superseded: "dữ liệu hồ sơ đã thay đổi giữa chừng",
  source_digest_mismatch: "dữ liệu hồ sơ đã thay đổi giữa chừng",
  stage_timeout: "quá thời gian xử lý",
  dead_lettered: "đã thử lại nhiều lần không thành công",
};

/**
 * A non-blocking notice when the deep-analysis (Next Best Action) stage did not
 * complete but the overview (360) stage did — so the dashboard can still render
 * the 360 report and explain why the actionable follow-up is missing, instead
 * of showing a hard error. Returns `null` for school runs and for runs where
 * the NBA stage completed.
 */
export function getDeepAnalysisNotice(run: {
  status: AnalysisRunStatus;
  stages: AnalysisRunStage[];
}): string | null {
  if (run.status === "queued" || run.status === "running") return null;
  const nba = run.stages.find((stage) => stage.stageKind === "next_best_action");
  const overview = run.stages.find(
    (stage) => stage.stageKind === "student_360",
  );
  if (!nba || nba.status === "completed") return null;
  if (!overview || overview.status !== "completed") return null;
  const reason = nba.terminalReason
    ? (TERMINAL_REASON_LABELS[nba.terminalReason] ?? nba.terminalReason)
    : null;
  return reason
    ? `Phân tích chuyên sâu (Hành động tiếp theo) chưa sẵn sàng — ${reason}.`
    : "Phân tích chuyên sâu (Hành động tiếp theo) chưa sẵn sàng.";
}

export const statusMeta: Record<
  AnalysisRunStatus,
  { label: string; color: "gray" | "primary" | "success" | "warning" | "error" }
> = {
  queued: { label: "Đã xếp hàng", color: "primary" },
  running: { label: "Đang phân tích", color: "primary" },
  completed: { label: "Đã hoàn tất", color: "success" },
  abstained: { label: "Chưa đủ dữ liệu", color: "warning" },
  failed: { label: "Phân tích thất bại", color: "error" },
  dead_lettered: { label: "Không thể hoàn tất", color: "error" },
};

export const stageLabels: Record<AnalysisRunStage["stageKind"], string> = {
  student_360: "360 học sinh",
  next_best_action: "Hành động tiếp theo",
  school_360: "360 trường",
};

export interface ClaimKindMeta {
  kind: AnalysisClaimKind;
  label: string;
  shortLabel: string;
  badgeColor: "primary" | "sky" | "success" | "warning";
  chartColor: string;
  dotClassName: string;
}

export const claimKindMeta: Record<AnalysisClaimKind, ClaimKindMeta> = {
  recommendation: {
    kind: "recommendation",
    label: "Đề xuất hành động",
    shortLabel: "Đề xuất",
    badgeColor: "primary",
    chartColor: "var(--primary-500)",
    dotClassName: "bg-primary-500",
  },
  inference: {
    kind: "inference",
    label: "Nhận định 360°",
    shortLabel: "Nhận định",
    badgeColor: "sky",
    chartColor: "var(--info-500)",
    dotClassName: "bg-info-500",
  },
  fact: {
    kind: "fact",
    label: "Dữ kiện thực tế",
    shortLabel: "Dữ kiện",
    badgeColor: "success",
    chartColor: "var(--success-500)",
    dotClassName: "bg-success-500",
  },
  uncertainty: {
    kind: "uncertainty",
    label: "Điểm cần lưu ý & Rủi ro",
    shortLabel: "Lưu ý",
    badgeColor: "warning",
    chartColor: "var(--warning-500)",
    dotClassName: "bg-warning-500",
  },
};

export interface AnalysisKpiData {
  totalClaims: number;
  recommendationsCount: number;
  inferencesCount: number;
  factsCount: number;
  uncertaintiesCount: number;
  sourcedCount: number;
  sourcedPercent: number;
  avgConfidence: number | null;
  totalSources: number;
}

export function computeAnalysisKpis(
  stages: AnalysisRunStage[],
): AnalysisKpiData {
  const claims = stages.flatMap((stage) => stage.claims);
  const totalClaims = claims.length;
  const recommendationsCount = claims.filter(
    (c) => c.claimKind === "recommendation",
  ).length;
  const inferencesCount = claims.filter(
    (c) => c.claimKind === "inference",
  ).length;
  const factsCount = claims.filter((c) => c.claimKind === "fact").length;
  const uncertaintiesCount = claims.filter(
    (c) => c.claimKind === "uncertainty",
  ).length;

  const sourcedClaims = claims.filter(
    (c) => c.provenanceIds && c.provenanceIds.length > 0,
  );
  const sourcedCount = sourcedClaims.length;
  const sourcedPercent =
    totalClaims > 0 ? Math.round((sourcedCount / totalClaims) * 100) : 100;

  const confidences = claims
    .map((c) => c.confidence)
    .filter(
      (conf): conf is number => conf !== null && typeof conf === "number",
    );

  const avgConfidence =
    confidences.length > 0
      ? Math.round(
          (confidences.reduce((acc, curr) => acc + curr, 0) /
            confidences.length) *
            100,
        )
      : null;

  const uniqueSources = new Set(claims.flatMap((c) => c.provenanceIds ?? []));
  const totalSources = uniqueSources.size;

  return {
    totalClaims,
    recommendationsCount,
    inferencesCount,
    factsCount,
    uncertaintiesCount,
    sourcedCount,
    sourcedPercent,
    avgConfidence,
    totalSources,
  };
}

export function formatClaimConfidence(
  confidence: number | null,
): { label: string; color: "success" | "primary" | "warning" } | null {
  if (confidence === null || confidence === undefined) return null;
  const percent = Math.round(confidence * 100);
  if (percent >= 85) return { label: `${percent}% tin cậy`, color: "success" };
  if (percent >= 65) return { label: `${percent}% tin cậy`, color: "primary" };
  return { label: `${percent}% tin cậy`, color: "warning" };
}
