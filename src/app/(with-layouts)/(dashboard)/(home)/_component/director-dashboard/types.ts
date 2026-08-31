export type {
  ActivityPoint,
  AdmissionsPipeline,
  AdmissionsTrend,
  AdmissionsTrendPoint,
  AdmissionsTrendTotals,
  BriefingAlert,
  BriefingPriorityAction,
  DirectorBriefing,
  DirectorKpi,
  DirectorOverviewData,
  DirectorOverviewParams,
  DirectorOverviewResponse,
  EnrollmentForecast,
  ForecastPoint,
  ForecastSummary,
  MarketOverviewItem,
  MetricTone,
  OverviewMeta,
  PipelineBiggestDrop,
  PipelineStage,
  PipelineSummary,
  SourcePerformance,
  TrendRange,
  WeeklyActivity,
  WeeklyActivityPoint,
} from "@/services/api/director-overview";

export type AiInsight = {
  id: string;
  type: "risk" | "opportunity" | "revenue";
  title: string;
  description: string;
  evidence: string;
  metric: string;
  href: string;
};

export type ExecutiveAction = {
  id: string;
  title: string;
  description: string;
  impact: string;
  href: string;
};

export type AttentionItem = {
  id: string;
  label: string;
  description: string;
  count: string;
  priority: "high" | "medium" | "low";
  tone: "primary" | "success" | "warning" | "danger" | "info";
  href: string;
};

export type TeamPerformance = {
  id: string;
  name: string;
  campus: string;
  activeLeads: string;
  sla: string;
  enrolled: string;
  conversion: string;
  trend: "up" | "down";
};

export type CampusPerformancePoint = {
  name: string;
  activeRecords: number;
  applicants: number;
  enrolled: number;
};
