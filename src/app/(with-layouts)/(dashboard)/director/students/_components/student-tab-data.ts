import type {
  StudentTaskItem,
} from "@/services/api/students/types";

const mockAssignee = "Trần Quốc Bảo";

export const touchpoints = [
  { date: "06/06 · 16:42", channel: "Cuộc gọi", title: "Tư vấn lần 2", detail: "Xác nhận ngành phù hợp; phụ huynh còn hỏi về chi phí.", tone: "success" as const },
  { date: "04/06 · 20:18", channel: "Zalo", title: "Phụ huynh hỏi học bổng", detail: "Đã gửi chính sách học bổng và hẹn gọi lại.", tone: "primary" as const },
  { date: "02/06 · 09:30", channel: "Sự kiện", title: "Check-in Open Day", detail: "Tham gia phiên chuyên ngành AI và hỏi về đầu ra.", tone: "success" as const },
  { date: "30/05 · 22:11", channel: "Website", title: "Xem trang học phí", detail: "Xem bảng phí 3 lần trong cùng một phiên truy cập.", tone: "warning" as const },
  { date: "28/05 · 14:05", channel: "Sự kiện", title: "Career Talk", detail: "Đăng ký nhận tư vấn và để lại nguyện vọng ngành AI.", tone: "primary" as const },
];

export const documents = [
  { name: "Phiếu đăng ký tư vấn", type: "Biểu mẫu trực tuyến", status: "Đã xác nhận", tone: "success" as const, date: "28/05/2026" },
  { name: "Bảng điểm lớp 11", type: "Tài liệu học tập", status: "Đã nhận", tone: "success" as const, date: "02/06/2026" },
  { name: "Chứng chỉ tiếng Anh", type: "Tài liệu học tập", status: "Chờ bổ sung", tone: "warning" as const, date: "Còn thiếu" },
  { name: "CCCD / giấy tờ tùy thân", type: "Hồ sơ nhập học", status: "Chưa bắt đầu", tone: "gray" as const, date: "—" },
  { name: "Minh chứng đối tượng học bổng", type: "Học bổng", status: "Chưa bắt đầu", tone: "gray" as const, date: "—" },
];

export const tasks: StudentTaskItem[] = [
  { id: "task-1", title: "Gọi xác nhận học phí với phụ huynh", assignee: mockAssignee, dueDate: "10/06/2026", dueTime: "16:00", taskType: "call", status: "todo", priority: "Cao", notes: "Gọi vào buổi chiều, hỏi thêm về học bổng theo học kỳ." },
  { id: "task-2", title: "Gửi hồ sơ học bổng bổ sung", assignee: mockAssignee, dueDate: "08/06/2026", dueTime: "09:00", taskType: "email", status: "in-progress", priority: "Trung bình" },
  { id: "task-3", title: "Nhắc nộp chứng chỉ tiếng Anh", assignee: mockAssignee, dueDate: "05/06/2026", dueTime: "10:30", taskType: "todo", status: "done", priority: "Thấp" },
];
