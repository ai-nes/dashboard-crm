import type {
  AnalysisClaimKind,
  AnalysisRunStage,
  AnalysisRunStatus,
} from "@/services/api/analysis-runs";

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
