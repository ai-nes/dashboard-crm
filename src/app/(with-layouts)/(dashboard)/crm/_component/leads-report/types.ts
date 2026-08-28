import type { SalesRepRawItem } from "@/services/api/crm";

export type { SalesRepRawItem };

export type PerformanceLevel = "excellent" | "good" | "at-risk";

export interface SalesRepViewModel {
  id: string;
  repName: string;
  avatarInitials: string;
  dealsClosed: number;
  revenue: string;
  performancePercent: number;
  performanceLevel: PerformanceLevel;
}
