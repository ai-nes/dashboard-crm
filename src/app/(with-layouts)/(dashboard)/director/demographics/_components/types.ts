export interface SegmentFilter {
  id: string;
  label: string;
  value: string;
}

export interface FunnelStage {
  label: string;
  value: string;
  width: number;
  conversion?: string;
}

export interface RegionOpportunity {
  rank: number;
  name: string;
  score: number;
  selected?: boolean;
}

export interface ComparisonMetric {
  label: string;
  primary: string;
  secondary: string;
  primaryWidth: number;
  secondaryWidth: number;
}
