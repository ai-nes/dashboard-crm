import type { SchoolClassification } from "@/services/api/schools/types";

export type RegionKey =
  | "all"
  | "north"
  | "central"
  | "highlands"
  | "south"
  | "mekong";

export type MetricKey =
  | "opportunity"
  | "leads"
  | "conversion"
  | "competition"
  | "revenue";

export type SchoolTier = "Tier 1" | "Tier 2" | "Tier 3";

export interface HighSchoolItem {
  id: string;
  directoryId: string | null;
  name: string;
  district: string | null;
  tier: SchoolTier | null;
  potentialScore: number | null;
  grade12Students: number | null;
  prospects: number | null;
  penetrationRate: number | null; // %
  applications: number | null;
  enrollmentForecast: number | null;
  conversionRate: number | null; // %
  lastActivity: string | null;
  recommendation: string | null;
  nextAction: string | null;
  classification: SchoolClassification | null;
}

export interface FptuCampusLocation {
  id: string;
  name: string;
  shortName: string;
  region: string;
  city: string;
  coordinates: [number, number]; // [lat, lng]
  currentEnrolled: number;
  target: number;
  highlightMajor: string;
}

export interface MapBounds {
  minLongitude: number;
  maxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
}

export interface RegionConfig {
  key: RegionKey;
  label: string;
  shortLabel: string;
  bounds: MapBounds;
}

export interface ProvinceMetrics {
  code: string;
  name: string;
  regionKey: RegionKey;
  opportunity: number | null; // 0 - 100
  leads: number | null;
  conversion: number | null; // %
  competition: number | null; // 0 - 100
  revenue: number | null; // Tỷ VND
  grade12Population: number | null;
  penetrationRate: number | null; // %
  trend: number | null; // % YoY
  recommendation: string | null;
  keyAction: string | null;
  highSchools: HighSchoolItem[];
}

export interface ProvinceGeometryDocument {
  Code: string;
  Name: string;
  FullName: string;
  GIS: {
    Geometry: GeoJSON.MultiPolygon;
    BoundingBox: {
      MinLongitude: number;
      MinLatitude: number;
      MaxLongitude: number;
      MaxLatitude: number;
    };
  };
}

export interface ProvinceFeatureProperties {
  code: string;
  name: string;
}

export type ProvinceFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.MultiPolygon,
  ProvinceFeatureProperties
>;
