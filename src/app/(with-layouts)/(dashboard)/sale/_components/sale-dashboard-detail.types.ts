import type {
  LeadProcessResolution,
  LeadProcessStatus,
} from "@/services/api/lead-sale/leads";
import type { SaleStudentAction, SaleTask } from "@/services/api/sale";

export interface SaleDashboardLeadRecord {
  id: string;
  leadCode: string;
  name: string;
  phone: string | null;
  school: string | null;
  processingStatus: LeadProcessStatus;
  resolution: LeadProcessResolution;
  source: string;
  createdAt: string;
  contactNoAnswer: number;
  contactSuccess: number;
  nextAction: string;
}

export interface SaleDashboardStudentRecord {
  student: SaleStudentAction;
  school: string;
  major: string;
  source: string;
  latestActivity: string;
}

export type SaleDashboardDetail =
  | { kind: "task"; task: SaleTask }
  | { kind: "lead"; lead: SaleDashboardLeadRecord }
  | { kind: "student"; record: SaleDashboardStudentRecord };
