import type { SaleStudentAction } from "@/services/api/sale";

import type {
  SaleDashboardLeadRecord,
  SaleDashboardStudentRecord,
} from "./sale-dashboard-detail.types";

export const MOCK_RECENT_SALE_LEADS: SaleDashboardLeadRecord[] = [
  {
    id: "LEAD-2026-00184",
    leadCode: "LD26-0184",
    name: "Lê Bảo Ngọc",
    phone: "0900 123 184",
    school: "THPT Nguyễn Thị Minh Khai",
    processingStatus: "NEW",
    resolution: "PENDING",
    source: "Website tuyển sinh",
    createdAt: "2026-09-18T08:42:00+07:00",
    contactNoAnswer: 0,
    contactSuccess: 0,
    nextAction: "Xác nhận nhu cầu và khung giờ tư vấn.",
  },
  {
    id: "LEAD-2026-00179",
    leadCode: "LD26-0179",
    name: "Phan Nhật Minh",
    phone: "0900 123 179",
    school: "THPT Gia Định",
    processingStatus: "ASSIGNED",
    resolution: "CREATED",
    source: "Ngày hội tuyển sinh",
    createdAt: "2026-09-17T15:10:00+07:00",
    contactNoAnswer: 0,
    contactSuccess: 0,
    nextAction: "Liên hệ lần đầu để xác nhận ngành quan tâm.",
  },
];

const mockStudents: SaleStudentAction[] = [
  {
    studentId: "STU-2026-00053",
    studentCode: "AI26-0053",
    studentName: "Võ Minh Thư",
    studentStage: "New",
    lifecycleStatus: "Lead",
    stageAgeDays: 2,
    lastActivityAt: "2026-09-17T09:10:00+07:00",
    attentionReason: "Mới đăng ký tư vấn, chưa xác nhận lịch.",
    nba: {
      actionCode: "CALL_PARENT",
      title: "Xác nhận lịch tư vấn đầu tiên",
      priority: "high",
      channel: "CALL",
      reason: "Học sinh đã chủ động đăng ký nhận tư vấn.",
      whyNow: "Liên hệ sớm giúp chốt lịch khi nhu cầu còn mới.",
      salesNextStep: "Xác nhận khung giờ và ngành học đang quan tâm.",
      scheduledAt: "2026-09-18T14:00:00+07:00",
    },
  },
  {
    studentId: "STU-2026-00115",
    studentCode: "AI26-0115",
    studentName: "Nguyễn Thu Hà",
    studentStage: "New",
    lifecycleStatus: "Lead",
    stageAgeDays: 1,
    lastActivityAt: "2026-09-18T08:10:00+07:00",
    attentionReason: "Hồ sơ mới từ ngày hội hướng nghiệp, chưa xác nhận ngành.",
    nba: {
      actionCode: "CONFIRM_INTEREST",
      title: "Gọi xác nhận nhu cầu tư vấn",
      priority: "high",
      channel: "CALL",
      reason: "Chưa có lần liên hệ nào sau khi đăng ký.",
      whyNow: "Liên hệ sớm sau sự kiện giúp làm rõ nhu cầu còn mới.",
      salesNextStep: "Xác nhận ngành quan tâm và lịch gọi thuận tiện.",
      scheduledAt: "2026-09-18T15:30:00+07:00",
    },
  },
];

export const MOCK_RECENT_SALE_STUDENTS: SaleDashboardStudentRecord[] = [
  {
    student: mockStudents[0],
    school: "THPT Nguyễn Du",
    major: "Marketing",
    source: "Tư vấn trực tuyến",
    latestActivity: "Đăng ký tư vấn · 17/09 lúc 09:10",
  },
  {
    student: mockStudents[1],
    school: "THPT Lê Quý Đôn",
    major: "Thiết kế đồ họa",
    source: "Ngày hội hướng nghiệp",
    latestActivity: "Đăng ký tư vấn · 18/09 lúc 08:10",
  },
];
