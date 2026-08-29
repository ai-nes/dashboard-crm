import type { DailyTask, PipelineLead, PipelineStage } from "./types";

export const stageLabels: Record<PipelineStage, string> = {
  new: "Mới",
  engaged: "Đã tương tác",
  qualified: "Đủ điều kiện",
  counselling: "Tư vấn",
  application: "Hồ sơ",
  accepted: "Trúng tuyển",
  enrolled: "Nhập học",
};

export const prioritySummary = [
  { label: "Follow-ups", count: 18, type: "follow-up" },
  { label: "lead nóng", count: 7, type: "hot" },
  { label: "cuộc gọi phụ huynh", count: 4, type: "parent" },
  { label: "hồ sơ vướng", count: 3, type: "application" },
] as const;

export const pipelineLeads: PipelineLead[] = [
  { id: "nguyen-minh-anh", name: "Nguyễn Minh Anh", initials: "MA", stage: "new", school: "THPT Chu Văn An", region: "Hà Nội", major: "Khoa học máy tính", source: "Website", score: 82, probability: 34, lastInteraction: "10 phút trước", nextAction: "Gọi giới thiệu chương trình", owner: "Phạm Thảo Vy", risk: "attention", riskLabel: "Cần liên hệ" },
  { id: "tran-gia-bao", name: "Trần Gia Bảo", initials: "GB", stage: "new", school: "THPT Nguyễn Huệ", region: "Hà Nội", major: "Kinh doanh quốc tế", source: "Open Day", score: 76, probability: 28, lastInteraction: "3 giờ trước", nextAction: "Gửi tài liệu ngành học", owner: "Lê Quang Huy", risk: "neutral" },
  { id: "pham-thu-ha", name: "Phạm Thu Hà", initials: "TH", stage: "new", school: "THPT Lê Quý Đôn", region: "Đà Nẵng", major: "Truyền thông đa phương tiện", source: "Facebook", score: 71, probability: 22, lastInteraction: "Hôm qua", nextAction: "Xác nhận nhu cầu tư vấn", owner: "Phạm Thảo Vy", risk: "neutral" },
  { id: "le-duc-minh", name: "Lê Đức Minh", initials: "DM", stage: "engaged", school: "THPT Kim Liên", region: "Hà Nội", major: "Kỹ thuật phần mềm", source: "Zalo OA", score: 84, probability: 46, lastInteraction: "30 phút trước", nextAction: "Đặt lịch tư vấn", owner: "Trần Minh Anh", risk: "attention", riskLabel: "Lead nóng" },
  { id: "vu-khanh-linh", name: "Vũ Khánh Linh", initials: "KL", stage: "engaged", school: "THPT Trần Phú", region: "Hải Phòng", major: "Thiết kế đồ họa", source: "Website", score: 78, probability: 41, lastInteraction: "2 giờ trước", nextAction: "Phản hồi câu hỏi học phí", owner: "Nguyễn Thu Hà", risk: "neutral" },
  { id: "do-anh-thu", name: "Đỗ Anh Thư", initials: "AT", stage: "engaged", school: "THPT Chuyên Lê Hồng Phong", region: "Nam Định", major: "Marketing", source: "Sự kiện", score: 73, probability: 38, lastInteraction: "2 ngày trước", nextAction: "Gửi recap Open Day", owner: "Lê Quang Huy", risk: "attention", riskLabel: "Giảm tương tác" },
  { id: "hoang-nam-khanh", name: "Hoàng Nam Khánh", initials: "NK", stage: "qualified", school: "THPT Amsterdam", region: "Hà Nội", major: "Kinh doanh quốc tế", source: "Giới thiệu", score: 88, probability: 58, lastInteraction: "1 giờ trước", nextAction: "Tư vấn học bổng", owner: "Trần Minh Anh", risk: "healthy" },
  { id: "bui-quang-huy", name: "Bùi Quang Huy", initials: "QH", stage: "qualified", school: "THPT Nguyễn Trãi", region: "TP. HCM", major: "Kỹ thuật phần mềm", source: "Website", score: 80, probability: 53, lastInteraction: "Hôm qua", nextAction: "Mời tư vấn trực tuyến", owner: "Nguyễn Thu Hà", risk: "neutral" },
  { id: "ngo-viet-anh", name: "Ngô Việt Anh", initials: "VA", stage: "counselling", school: "THPT Việt Đức", region: "Hà Nội", major: "Tài chính - Ngân hàng", source: "Zalo OA", score: 82, probability: 66, lastInteraction: "15 phút trước", nextAction: "Gọi phụ huynh xác nhận", owner: "Trần Minh Anh", risk: "attention", riskLabel: "Phụ huynh chờ phản hồi" },
  { id: "phan-nhat-minh", name: "Phan Nhật Minh", initials: "NM", stage: "counselling", school: "THPT Chu Văn An", region: "Hà Nội", major: "AI / Computer Science", source: "Website", score: 86, probability: 69, lastInteraction: "2 giờ trước", nextAction: "Gửi lộ trình hồ sơ", owner: "Phạm Thảo Vy", risk: "neutral" },
  { id: "trinh-mai-anh", name: "Trịnh Mai Anh", initials: "MA", stage: "counselling", school: "THPT Phan Châu Trinh", region: "Đà Nẵng", major: "Truyền thông đa phương tiện", source: "Open Day", score: 75, probability: 62, lastInteraction: "Hôm qua", nextAction: "Đặt lịch campus tour", owner: "Lê Quang Huy", risk: "healthy" },
  { id: "dang-minh-khang", name: "Đặng Minh Khang", initials: "MK", stage: "application", school: "THPT Lê Quý Đôn", region: "TP. HCM", major: "Khoa học máy tính", source: "Giới thiệu", score: 90, probability: 74, lastInteraction: "45 phút trước", nextAction: "Kiểm tra chứng chỉ tiếng Anh", owner: "Trần Minh Anh", risk: "attention", riskLabel: "Hồ sơ thiếu" },
  { id: "nguyen-phuong-linh", name: "Nguyễn Phương Linh", initials: "PL", stage: "application", school: "THPT Chuyên Hà Nội - Amsterdam", region: "Hà Nội", major: "Kinh doanh quốc tế", source: "Website", score: 87, probability: 78, lastInteraction: "3 giờ trước", nextAction: "Nhắc hoàn tất hồ sơ", owner: "Nguyễn Thu Hà", risk: "critical", riskLabel: "Quá hạn 1 ngày" },
  { id: "luu-minh-quan", name: "Lưu Minh Quân", initials: "MQ", stage: "accepted", school: "THPT Nguyễn Thị Minh Khai", region: "TP. HCM", major: "Marketing", source: "Sự kiện", score: 85, probability: 86, lastInteraction: "1 giờ trước", nextAction: "Xác nhận thư nhập học", owner: "Phạm Thảo Vy", risk: "healthy" },
  { id: "tran-bao-ngoc", name: "Trần Bảo Ngọc", initials: "BN", stage: "accepted", school: "THPT Trần Phú", region: "Hải Phòng", major: "Thiết kế đồ họa", source: "Facebook", score: 79, probability: 83, lastInteraction: "Hôm qua", nextAction: "Gọi chúc mừng gia đình", owner: "Lê Quang Huy", risk: "neutral" },
  { id: "mai-duc-anh", name: "Mai Đức Anh", initials: "DA", stage: "enrolled", school: "THPT Chuyên Ngoại ngữ", region: "Hà Nội", major: "Kỹ thuật phần mềm", source: "Website", score: 89, probability: 96, lastInteraction: "2 giờ trước", nextAction: "Hoàn tất định hướng đầu khóa", owner: "Trần Minh Anh", risk: "healthy" },
  { id: "vo-ha-my", name: "Võ Hà My", initials: "HM", stage: "enrolled", school: "THPT Nguyễn Bỉnh Khiêm", region: "Đà Nẵng", major: "Tài chính - Ngân hàng", source: "Giới thiệu", score: 83, probability: 94, lastInteraction: "Hôm qua", nextAction: "Gửi lịch sinh hoạt đầu khóa", owner: "Nguyễn Thu Hà", risk: "healthy" },
];

export const dailyTasks: DailyTask[] = [
  { id: "task-1", leadId: "nguyen-minh-anh", title: "Gọi giới thiệu chương trình", dueLabel: "Hôm nay, 09:30", type: "follow-up" },
  { id: "task-2", leadId: "le-duc-minh", title: "Đặt lịch tư vấn cùng phụ huynh", dueLabel: "Hôm nay, 10:00", type: "hot" },
  { id: "task-3", leadId: "ngo-viet-anh", title: "Gọi phụ huynh xác nhận", dueLabel: "Hôm nay, 14:00", type: "parent" },
  { id: "task-4", leadId: "nguyen-phuong-linh", title: "Bổ sung chứng chỉ tiếng Anh", dueLabel: "Quá hạn 1 ngày", type: "application", isOverdue: true },
  { id: "task-5", leadId: "trinh-mai-anh", title: "Xác nhận lịch campus tour", dueLabel: "Hôm nay, 16:00", type: "visit" },
];
