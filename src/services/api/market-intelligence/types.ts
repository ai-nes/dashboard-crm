export type AvailabilityStatus = "available" | "partial" | "unavailable";

export interface DataAvailability {
  status?: AvailabilityStatus;
  sections: Record<string, AvailabilityStatus>;
  fields: Record<string, AvailabilityStatus>;
}

export type MarketRegionKey = "all" | "north" | "central" | "highlands" | "south" | "mekong";
export type MarketSchoolClassification = "Trọng điểm" | "Mở rộng" | "Duy trì" | "Sàng lọc" | null;

export interface DirectorMarketSchool {
  id: string;
  directoryId: string | null;
  name: string;
  district: string | null;
  tier: "Tier 1" | "Tier 2" | "Tier 3" | null;
  potentialScore: number | null;
  grade12Students: number | null;
  prospects: number | null;
  penetrationRate: number | null;
  applications: number | null;
  enrollmentForecast: number | null;
  conversionRate: number | null;
  lastActivity: string | null;
  recommendation: string | null;
  nextAction: string | null;
  classification: MarketSchoolClassification;
}

export interface DirectorMarketProvince {
  code: string;
  name: string;
  regionKey: MarketRegionKey;
  opportunity: number | null;
  leads: number | null;
  conversion: number | null;
  competition: number | null;
  revenue: number | null;
  grade12Population: number | null;
  penetrationRate: number | null;
  trend: number | null;
  recommendation: string | null;
  keyAction: string | null;
  highSchools: DirectorMarketSchool[];
}

export interface DirectorMarketOverview {
  provinces: DirectorMarketProvince[];
  totalProvinces: number | null;
  totalSchools: number | null;
  admissionYear: number | null;
  asOf: string | null;
  dataAvailability: DataAvailability;
}

export interface DirectorMarketParams {
  admissionYear?: number;
  period?: "30d";
  region?: MarketRegionKey;
  metric?: "opportunity" | "leads" | "conversion" | "competition" | "revenue";
  includeSchools?: boolean;
  schoolLimit?: number;
}
