export type MetricTone = "primary" | "success" | "warning" | "danger" | "info";

export type DirectorKpi = {
  id: string;
  label: string;
  value: string;
  target: string;
  achievement: string;
  change: string;
  helper: string;
  tone: MetricTone;
};

export type PipelineStage = {
  id: string;
  label: string;
  value: string;
  percentage: number;
  conversion: string;
  barClassName: string;
};

export type MarketOverviewItem = {
  id: string;
  name: string;
  prospects: string;
  enrolled: string;
  conversion: string;
  growth: string;
  coverage: number;
  tone: MetricTone;
};

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
  tone: MetricTone;
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

export type SourcePerformance = {
  id: string;
  label: string;
  leads: string;
  applicants: string;
  enrolled: string;
  share: number;
  barClassName: string;
  chartColor: string;
};

export type AdmissionsTrendPoint = {
  label: string;
  newLeads: number;
  applicants: number;
  enrolled: number;
};

export type ForecastPoint = {
  label: string;
  actual: number | null;
  forecast: number;
  target: number;
};

export type CampusPerformancePoint = {
  name: string;
  activeRecords: number;
  applicants: number;
  enrolled: number;
};

export type ActivityPoint = {
  label: string;
  interactions: number;
  sla: number;
};
