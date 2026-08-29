export type AttributionConfidence = "high" | "medium" | "low";
export type CampaignHealth = "on_track" | "watch" | "reallocate";

export interface CampaignRecord {
  id: string;
  name: string;
  channel: string;
  spend: number;
  qualifiedLeads: number;
  applications: number;
  enrollments: number;
  confirmedRevenue: number;
  pipelineRevenue: number;
  roas: number;
  cpql: number;
  enrollmentRate: number;
  attributionConfidence: AttributionConfidence;
  health: CampaignHealth;
}

export interface CampaignIntelligenceResponse {
  generatedAt: string;
  summary: {
    spend: number;
    qualifiedLeads: number;
    applications: number;
    enrollments: number;
    confirmedRevenue: number;
    roas: number;
  };
  trend: Array<{ label: string; spend: number; confirmedRevenue: number }>;
  funnel: Array<{ label: string; count: number; conversionRate?: number }>;
  campaigns: CampaignRecord[];
  recommendation: {
    title: string;
    impact: number;
    confidence: AttributionConfidence;
    evidence: string[];
  };
}
