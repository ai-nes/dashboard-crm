export type ResultsPeriod = "current" | "previous";

export interface ResultKpi {
  id: string;
  label: string;
  value: number;
  note: string;
  tone: "primary" | "info" | "success" | "warning";
}

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
  retention?: string;
  color: string;
}

export interface TrendPoint {
  label: string;
  contacted: number;
  transferred: number;
}

export interface ContactOutcome {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface ProcessingMetric {
  id: string;
  label: string;
  value: string;
  note: string;
  tone: "primary" | "info" | "success" | "warning";
  progress?: number;
}

export interface ResultsDataset {
  periodLabel: string;
  dateLabel: string;
  kpis: ResultKpi[];
  funnel: FunnelStage[];
  trend: TrendPoint[];
  outcomes: ContactOutcome[];
  performance: ProcessingMetric[];
}

export const resultsData: Record<ResultsPeriod, ResultsDataset> = {
  current: {
    periodLabel: "Tháng này",
    dateLabel: "01–30/09/2026",
    kpis: [
      { id: "assigned", label: "Được giao", value: 86, note: "hồ sơ trong kỳ", tone: "primary" },
      { id: "contacted", label: "Đã liên hệ", value: 72, note: "83,7% được giao", tone: "info" },
      { id: "connected", label: "Kết nối", value: 54, note: "75,0% đã liên hệ", tone: "success" },
      { id: "qualified", label: "Có nhu cầu", value: 31, note: "57,4% kết nối", tone: "warning" },
      { id: "transferred", label: "Chuyển Sale", value: 18, note: "58,1% có nhu cầu", tone: "primary" },
    ],
    funnel: [
      { id: "assigned", label: "Được giao", value: 86, color: "var(--primary-300)", retention: "83,7%" },
      { id: "contacted", label: "Đã liên hệ", value: 72, color: "var(--primary-500)", retention: "75,0%" },
      { id: "connected", label: "Kết nối", value: 54, color: "var(--info-500)", retention: "57,4%" },
      { id: "qualified", label: "Có nhu cầu", value: 31, color: "var(--warning-500)", retention: "58,1%" },
      { id: "transferred", label: "Chuyển Sale", value: 18, color: "var(--success-500)" },
    ],
    trend: [
      { label: "Tuần 1", contacted: 15, transferred: 3 },
      { label: "Tuần 2", contacted: 18, transferred: 4 },
      { label: "Tuần 3", contacted: 20, transferred: 5 },
      { label: "Tuần 4", contacted: 19, transferred: 6 },
    ],
    outcomes: [
      { id: "missed", label: "Không bắt máy", value: 18, color: "var(--primary-300)" },
      { id: "follow-up", label: "Follow-up", value: 16, color: "var(--info-500)" },
      { id: "qualified", label: "Có nhu cầu", value: 11, color: "var(--success-500)" },
      { id: "not-interested", label: "Không quan tâm", value: 7, color: "var(--text-200)" },
    ],
    performance: [
      { id: "on-time", label: "Task đúng hạn", value: "92%", note: "mục tiêu 90%", tone: "success", progress: 92 },
      { id: "response-time", label: "Phản hồi TB", value: "24 phút", note: "nhanh hơn 8 phút", tone: "info" },
      { id: "follow-up-count", label: "Follow-up TB", value: "2,4", note: "lần / hồ sơ", tone: "warning" },
      { id: "transfer-rate", label: "Chuyển Sale", value: "20,9%", note: "trên tổng hồ sơ", tone: "primary", progress: 21 },
    ],
  },
  previous: {
    periodLabel: "Tháng trước",
    dateLabel: "01–31/08/2026",
    kpis: [
      { id: "assigned", label: "Được giao", value: 78, note: "hồ sơ trong kỳ", tone: "primary" },
      { id: "contacted", label: "Đã liên hệ", value: 65, note: "83,3% được giao", tone: "info" },
      { id: "connected", label: "Kết nối", value: 47, note: "72,3% đã liên hệ", tone: "success" },
      { id: "qualified", label: "Có nhu cầu", value: 26, note: "55,3% kết nối", tone: "warning" },
      { id: "transferred", label: "Chuyển Sale", value: 15, note: "57,7% có nhu cầu", tone: "primary" },
    ],
    funnel: [
      { id: "assigned", label: "Được giao", value: 78, color: "var(--primary-300)", retention: "83,3%" },
      { id: "contacted", label: "Đã liên hệ", value: 65, color: "var(--primary-500)", retention: "72,3%" },
      { id: "connected", label: "Kết nối", value: 47, color: "var(--info-500)", retention: "55,3%" },
      { id: "qualified", label: "Có nhu cầu", value: 26, color: "var(--warning-500)", retention: "57,7%" },
      { id: "transferred", label: "Chuyển Sale", value: 15, color: "var(--success-500)" },
    ],
    trend: [
      { label: "Tuần 1", contacted: 14, transferred: 3 },
      { label: "Tuần 2", contacted: 15, transferred: 4 },
      { label: "Tuần 3", contacted: 17, transferred: 3 },
      { label: "Tuần 4", contacted: 19, transferred: 5 },
    ],
    outcomes: [
      { id: "missed", label: "Không bắt máy", value: 17, color: "var(--primary-300)" },
      { id: "follow-up", label: "Follow-up", value: 15, color: "var(--info-500)" },
      { id: "qualified", label: "Có nhu cầu", value: 10, color: "var(--success-500)" },
      { id: "not-interested", label: "Không quan tâm", value: 8, color: "var(--text-200)" },
    ],
    performance: [
      { id: "on-time", label: "Task đúng hạn", value: "89%", note: "mục tiêu 90%", tone: "warning", progress: 89 },
      { id: "response-time", label: "Phản hồi TB", value: "32 phút", note: "trong giờ làm việc", tone: "info" },
      { id: "follow-up-count", label: "Follow-up TB", value: "2,1", note: "lần / hồ sơ", tone: "warning" },
      { id: "transfer-rate", label: "Chuyển Sale", value: "19,2%", note: "trên tổng hồ sơ", tone: "primary", progress: 19 },
    ],
  },
};
