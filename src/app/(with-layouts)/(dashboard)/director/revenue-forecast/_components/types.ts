export type RevenueMetricTone = "primary" | "success" | "warning" | "danger" | "info";

export type RevenueKpi = {
  id: string;
  label: string;
  value: string;
  target: string;
  achievement: string;
  change: string;
  helper: string;
  tone: RevenueMetricTone;
};

export type RevenueForecastPoint = {
  label: string;
  actual: number | null;
  forecast: number | null;
  target: number;
};

export type RevenueModelItem = {
  id: string;
  label: string;
  value: string;
  amount: number;
  note: string;
  tone: RevenueMetricTone;
};

export type RevenueRegion = {
  id: string;
  label: string;
  actual: number;
  forecast: number;
  share: number;
};

export type RevenueScenario = {
  id: string;
  label: string;
  description: string;
  enrollment: string;
  enrollmentValue: number;
  revenue: string;
  revenueValue: number;
  delta: string;
  impact: string;
};

export type ForecastDriver = {
  id: string;
  label: string;
  value: string;
  description: string;
  tone: "positive" | "negative";
};
