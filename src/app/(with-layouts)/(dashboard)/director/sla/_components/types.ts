export type SlaTone = "success" | "warning" | "error";

export interface SlaMetric {
  label: string;
  value: string;
  detail: string;
  tone: SlaTone;
}

export interface SlaStatusBucket {
  label: string;
  value: string;
  share: string;
  shareValue: number;
  detail: string;
  tone: SlaTone;
}

export interface SlaRiskCase {
  studentId?: string;
  name: string;
  school: string;
  probability: number | null;
  silentFor: string;
  owner: string;
  priority: "Cao" | "Theo dõi";
  href?: string;
}

export interface SlaRiskReason {
  label: string;
  percentage: number;
  detail: string;
}
