export type DemographicTone = "primary" | "info" | "success" | "warning" | "danger";

export interface SegmentFilter {
  id: string;
  label: string;
  value: string;
}

export interface SegmentChannel {
  name: string;
  value: number;
  fill?: string;
}

export interface SegmentTrendPoint {
  month: string;
  current: number;
  benchmark: number;
}

export interface DemographicKpi {
  id: string;
  label: string;
  value: string;
  change: string;
  helper: string;
  progress: number;
  tone: DemographicTone;
}

export interface DemandTrendPoint {
  month: string;
  ai: number;
  software: number;
  business: number;
  design: number;
}

export interface DemandSummaryItem {
  id: string;
  label: string;
  value: number;
  change: number | null;

export interface DemandOverview {
  trend: DemandTrendPoint[];
  summary: DemandSummaryItem[];
}

export interface AudienceGender {
  id: string;
  name: string;
  value: number;
  fill?: string;
}

export interface AudienceProfile {
  id: string;
  label: string;
  value: number;
  count: number;
  detail?: string;
  color?: string;
}

export interface AudienceComposition {
  total: number;
  gender: AudienceGender[];
  profiles: AudienceProfile[];
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
  tuition: number | null;
  revenue: number | null;
  growth: number;
  coverage: number;
  opportunityScore: number;
  tone: DemographicTone;
  filters: SegmentFilter[];
  channels: SegmentChannel[];
  monthlyProspects: SegmentTrendPoint[];
}

export interface RegionOpportunity {
  rank: number;
  name: string;
  score: number;
  selected?: boolean;
}

export interface RegionalDemandMatrix {
  columns: Array<{ id: string; name: string }>;
  rows: Array<{
    interest: string;
    scores: Record<string, number>;
  }>;
}

export interface DataCoverageMetric {
  label: string;
  detail: string;
  value: number;
  tone: "success" | "warning" | "danger";
}

export interface SegmentNextActionStep {
  order: number;
  title: string;
  detail: string;
}

export interface SegmentNextAction {
  priority: "high" | "normal";
  label: string;
  title: string;
  description: string;
  steps: SegmentNextActionStep[];
}

export interface SegmentGuardrail {
  criterion: string;
  issue: string;
  replacement: string;
  status: string;
  tone: "success" | "warning" | "error";
}

export interface DirectorDemographicsOverviewParams {
  admissionYear?: number;
  period?: "6m" | "12m" | "season" | string;
  scope?: "all" | string;
}

export interface DirectorDemographicsOverviewData {
  kpis: DemographicKpi[];
  demand: DemandOverview;
  audienceComposition: AudienceComposition;
  segments: DemographicSegment[];
  regionOpportunities: RegionOpportunity[];
  regionalDemand: RegionalDemandMatrix;
  dataCoverage: DataCoverageMetric[];
}

export interface DirectorDemographicsOverviewMeta {
  admissionYear: number;
  period: string;
  scope: string;
  asOf: string;
  totalProspects: number;
  minSampleSize: number;
  dataAvailability?: {
    trend: boolean;
    tuition: boolean;
    revenue: boolean;
    eligibleSegments: number;
  };
}

export interface DirectorDemographicsOverviewResponse {
  data: DirectorDemographicsOverviewData;
  meta: DirectorDemographicsOverviewMeta;
}

export interface DirectorDemographicsSegmentParams {
  segment_id: string;
  admissionYear?: number;
}

export interface DirectorDemographicsSegmentData {
  segment: DemographicSegment;
  benchmark: DemographicSegment;
  regionOpportunities: RegionOpportunity[];
  nextAction: SegmentNextAction;
  guardrails: SegmentGuardrail[];
}

export interface DirectorDemographicsSegmentMeta {
  admissionYear: number;
  asOf: string;
  minSampleSize: number;
  sampleSize: number;
}

export interface DirectorDemographicsSegmentResponse {
  data: DirectorDemographicsSegmentData;
  meta: DirectorDemographicsSegmentMeta;
}

