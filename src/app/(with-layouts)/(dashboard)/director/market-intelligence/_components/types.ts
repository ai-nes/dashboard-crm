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
  directoryId?: string;
  name: string;
  district: string;
  tier: SchoolTier;
  potentialScore: number;
  grade12Students: number;
  prospects: number;
  penetrationRate: number; // %
  applications: number;
  enrollmentForecast: number;
  conversionRate: number; // %
  lastActivity: string;
  recommendation: string;
  nextAction: string;
  status: "high-yield" | "active" | "untapped" | "needs-attention";
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
  opportunity: number; // 0 - 100
  leads: number;
  conversion: number; // %
  competition: number; // 0 - 100
  revenue: number; // Tỷ VND
  grade12Population: number;
  penetrationRate: number; // %
  trend: number; // % YoY
  recommendation: string;
  keyAction: string;
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
