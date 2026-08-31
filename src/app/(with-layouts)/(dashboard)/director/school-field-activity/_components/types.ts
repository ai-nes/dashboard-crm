export type ActivityTone = "primary" | "success" | "warning" | "error";

export interface ActivityKpi {
  label: string;
  value: string;
  detail: string;
  tone: ActivityTone;
}

export interface FieldActivity {
  name: string;
  shortName: string;
  date: string;
  location: string;
  owner: string;
  cost: number;
  leads: number;
  verifiedRate: number;
  qualified: number;
  enrolled: number;
  costPerEnrollment: number;
}

export interface UpcomingActivity {
  name: string;
  location: string;
  date: string;
  expectedEnrollment: string;
  confidence: number;
}

export interface TeamDataQuality {
  name: string;
  records: number;
  secondsPerRecord: number;
  duplicateRate: number;
  missingRate: number;
}

export interface DataQualityMetric {
  label: string;
  value: number;
  target: number;
}

export interface DeviceSyncStatus {
  device: string;
  activity: string;
  synced: number;
  pending: number;
  errors: number;
  lastUpdated: string;
}
