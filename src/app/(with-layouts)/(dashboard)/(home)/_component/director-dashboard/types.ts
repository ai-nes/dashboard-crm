export type MetricTone = "primary" | "success" | "warning" | "danger" | "info";

export type DirectorKpi = {
  id: string;
  label: string;
  value: string;
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
};

