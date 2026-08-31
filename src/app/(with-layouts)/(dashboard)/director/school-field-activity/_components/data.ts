import type {
  ActivityKpi,
  DataQualityMetric,
  DeviceSyncStatus,
  FieldActivity,
  TeamDataQuality,
  UpcomingActivity,
} from "./types";

export const activityKpis: ActivityKpi[] = [
  { label: "Hoạt động đã triển khai", value: "42", detail: "Tăng 18% so với cùng kỳ", tone: "primary" },
  { label: "Hồ sơ thu được", value: "9.840", detail: "16,8% tổng hồ sơ", tone: "success" },
  { label: "Chi phí mỗi học sinh nhập học", value: "1,4 tr", detail: "Kênh số: 2,5 tr", tone: "success" },
  { label: "Tỷ lệ hồ sơ chuyển thành nhập học", value: "11,0%", detail: "Kênh số: 4,1%", tone: "primary" },
  { label: "Hồ sơ chưa đồng bộ", value: "184", detail: "Cần kiểm tra ngay", tone: "error" },
];

export const fieldActivities: FieldActivity[] = [
  { name: "Ngày hội hướng nghiệp — THPT Châu Văn Liêm", shortName: "THPT Châu Văn Liêm", date: "28/05", location: "Cần Thơ", owner: "Trần Q. Bảo", cost: 18, leads: 62, verifiedRate: 91.9, qualified: 34, enrolled: 11, costPerEnrollment: 1.6 },
  { name: "Ngày hội trải nghiệm cơ sở Cần Thơ", shortName: "Trải nghiệm cơ sở", date: "14/03", location: "Cần Thơ", owner: "Nguyễn T. Hà", cost: 86, leads: 214, verifiedRate: 96.3, qualified: 118, enrolled: 42, costPerEnrollment: 2.0 },
  { name: "Tư vấn tại lớp — THPT Bùi Hữu Nghĩa", shortName: "Tư vấn tại lớp", date: "12/07", location: "Cần Thơ", owner: "Nguyễn T. Hà", cost: 12, leads: 34, verifiedRate: 79.4, qualified: 14, enrolled: 3, costPerEnrollment: 4.0 },
  { name: "Hội thảo phụ huynh — Học phí & học bổng", shortName: "Hội thảo phụ huynh", date: "09/11", location: "Cần Thơ", owner: "Lê V. Cường", cost: 24, leads: 64, verifiedRate: 98.4, qualified: 51, enrolled: 24, costPerEnrollment: 1.0 },
  { name: "Ngày hội tuyển sinh Vĩnh Long", shortName: "Ngày hội Vĩnh Long", date: "22/04", location: "Vĩnh Long", owner: "Lê V. Cường", cost: 42, leads: 178, verifiedRate: 84.3, qualified: 62, enrolled: 18, costPerEnrollment: 2.3 },
  { name: "Ngày hội hướng nghiệp — THPT Thới Lai", shortName: "THPT Thới Lai", date: "18/06", location: "Cần Thơ", owner: "Trần Q. Bảo", cost: 16, leads: 41, verifiedRate: 87.8, qualified: 19, enrolled: 6, costPerEnrollment: 2.7 },
];

export const upcomingActivities: UpcomingActivity[] = [
  { name: "Ngày hội hướng nghiệp + gặp phụ huynh", location: "THPT Châu Văn Liêm", date: "07/09", expectedEnrollment: "+9 đến +14 học sinh", confidence: 71 },
  { name: "Cụm 3 trường tại Ninh Kiều", location: "Cần Thơ", date: "14/09", expectedEnrollment: "+18 đến +26 học sinh", confidence: 64 },
  { name: "Ngày hội trải nghiệm cơ sở Cần Thơ", location: "Cần Thơ", date: "28/09", expectedEnrollment: "+34 đến +48 học sinh", confidence: 78 },
];

export const teamDataQuality: TeamDataQuality[] = [
  { name: "Trần Quốc Bảo", records: 137, secondsPerRecord: 38, duplicateRate: 2.1, missingRate: 4.4 },
  { name: "Nguyễn Thị Hà", records: 248, secondsPerRecord: 52, duplicateRate: 8.9, missingRate: 14.2 },
  { name: "Lê Văn Cường", records: 242, secondsPerRecord: 41, duplicateRate: 1.2, missingRate: 2.9 },
];

export const dataQualityMetrics: DataQualityMetric[] = [
  { label: "Số điện thoại liên lạc được", value: 92.4, target: 95 },
  { label: "Đồng ý xử lý dữ liệu", value: 97.8, target: 100 },
  { label: "Có ảnh phiếu đính kèm", value: 61.2, target: 80 },
];

export const deviceSyncStatuses: DeviceSyncStatus[] = [
  { device: "Máy 04 · Nguyễn T. Hà", activity: "Tư vấn tại lớp · 12/07", synced: 34, pending: 128, errors: 12, lastUpdated: "3 giờ 20 phút trước" },
  { device: "Máy 01 · Trần Q. Bảo", activity: "Career Talk · 18/06", synced: 41, pending: 0, errors: 0, lastUpdated: "2 phút trước" },
  { device: "Máy 07 · Lê V. Cường", activity: "Ngày hội Vĩnh Long", synced: 178, pending: 44, errors: 0, lastUpdated: "18 phút trước" },
];
