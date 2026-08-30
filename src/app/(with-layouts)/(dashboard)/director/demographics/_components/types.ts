export interface SegmentFilter {
  id: string;
  label: string;
  value: string;
}

export interface RegionOpportunity {
  rank: number;
  name: string;
  score: number;
  selected?: boolean;
}

export type DemographicTone = "primary" | "info" | "success" | "warning" | "danger";

export interface DemographicKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  helper: string;
  progress: number;
  tone: DemographicTone;
}

export interface DemographicSegment {
  id: string;
  name: string;
  shortName: string;
  description: string;
  region: string;
  interest: string;
  prospects: number;
  engaged: number;
  qualified: number;
  counselling: number;
  applications: number;
  enrolled: number;
  conversion: number;
  tuition: number;
  revenue: number;
  growth: number;
  coverage: number;
  opportunityScore: number;
  tone: DemographicTone;
  filters: SegmentFilter[];
}

export interface DataCoverageMetric {
  label: string;
  detail: string;
  value: number;
  tone: "success" | "warning" | "danger";
}
