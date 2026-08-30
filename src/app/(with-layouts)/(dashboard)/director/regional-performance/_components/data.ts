import type { CapabilityRow, FunnelStage, MonthlyTrend, PriorityAction, RegionPerformance } from "./types";

export const regions: RegionPerformance[] = [
  { id: "north", name: "Miền Bắc", applications: 2134, enrollments: 482, targetAchievement: 92, conversion: 22.6, applicationChange: 12.5, enrollmentChange: 15.4, activeAdvisors: 18, capacity: 78, health: "good", capability: 8.7 },
  { id: "central", name: "Miền Trung", applications: 1287, enrollments: 276, targetAchievement: 71, conversion: 21.4, applicationChange: -3.2, enrollmentChange: -2.1, activeAdvisors: 11, capacity: 92, health: "watch", capability: 6.1 },
  { id: "south", name: "Miền Nam", applications: 1798, enrollments: 419, targetAchievement: 84, conversion: 23.3, applicationChange: 6.8, enrollmentChange: 8.3, activeAdvisors: 15, capacity: 86, health: "watch", capability: 7.2 },
];

export const trendData: MonthlyTrend[] = [
  { month: "T2", applications: 720, enrollments: 138, previousApplications: 655 }, { month: "T3", applications: 840, enrollments: 169, previousApplications: 702 }, { month: "T4", applications: 1010, enrollments: 210, previousApplications: 814 }, { month: "T5", applications: 1160, enrollments: 248, previousApplications: 925 }, { month: "T6", applications: 1292, enrollments: 292, previousApplications: 1014 }, { month: "T7", applications: 1530, enrollments: 348, previousApplications: 1170 },
];

export const funnelData: FunnelStage[] = [
  { stage: "Hồ sơ", north: 2134, central: 1287, south: 1798 }, { stage: "Đánh giá", north: 1465, central: 772, south: 1128 }, { stage: "Phỏng vấn", north: 784, central: 421, south: 659 }, { stage: "Nhập học", north: 482, central: 276, south: 419 },
];

export const capabilityRows: CapabilityRow[] = [
  { label: "Tạo nguồn hồ sơ", north: "good", central: "watch", south: "good" }, { label: "Tư vấn & chăm sóc", north: "good", central: "critical", south: "good" }, { label: "Chất lượng hồ sơ", north: "good", central: "watch", south: "watch" }, { label: "Chuyển đổi nhập học", north: "good", central: "watch", south: "good" }, { label: "Quản lý chiến dịch", north: "good", central: "critical", south: "watch" }, { label: "Năng suất đội ngũ", north: "good", central: "critical", south: "watch" },
];

export const priorityActions: PriorityAction[] = [
  { id: "a1", title: "Bổ sung 2 tư vấn viên cho Miền Trung", detail: "Đội ngũ đã dùng 92% khả năng xử lý hồ sơ.", region: "Miền Trung", priority: "Cao", tone: "critical" }, { id: "a2", title: "Hướng dẫn xử lý hồ sơ khó", detail: "Tỷ lệ hồ sơ qua bước đánh giá thấp hơn 6,4 điểm phần trăm.", region: "Miền Trung", priority: "Cao", tone: "critical" }, { id: "a3", title: "Rà soát mục tiêu nhập học", detail: "Tiến độ hiện tại thấp hơn kế hoạch 9 điểm phần trăm.", region: "Miền Trung", priority: "Trung bình", tone: "watch" }, { id: "a4", title: "Nhân rộng cách tư vấn hiệu quả", detail: "Tỷ lệ hồ sơ chuyển thành nhập học ở Miền Nam cao hơn kỳ trước 1,7 điểm phần trăm.", region: "Miền Nam", priority: "Thấp", tone: "good" },
];
