import type { ActivityLogModule } from "@/services/api/activity-log";

export const ACTIVITY_LOG_MODULES: {
  value: ActivityLogModule;
  label: string;
}[] = [
  { value: "all", label: "Tất cả" },
  { value: "auth", label: "Đăng nhập" },
  { value: "lead_student", label: "Lead & Học sinh" },
  { value: "segment", label: "Segment" },
  { value: "campaign_nba", label: "Chiến dịch & NBA" },
  { value: "permissions", label: "Phân quyền" },
];
