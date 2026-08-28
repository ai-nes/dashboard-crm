export type ReportPeriod = "last-week" | "last-month" | "last-year";

export interface ReportPeriodOption {
  id: ReportPeriod;
  label: string;
}
