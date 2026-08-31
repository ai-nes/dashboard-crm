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
  name: string;
  school: string;
  probability: number;
  silentFor: string;
  owner: string;
  priority: "Cao" | "Theo dõi";
}

export interface SlaRiskReason {
  label: string;
  percentage: number;
  detail: string;
}
