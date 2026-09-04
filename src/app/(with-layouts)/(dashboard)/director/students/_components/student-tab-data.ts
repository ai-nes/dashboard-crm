import type {
  StudentCallRecord,
  StudentTaskItem,
  StudentZaloMessage,
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

export const zaloMessages: StudentZaloMessage[] = [
  {
    id: "zalo-1",
    time: "06/06/2026 · 16:42",
    senderName: "Nguyễn Văn Minh",
    senderRole: "Bố của học sinh",
    recipientName: mockAssignee,
    recipientRole: "Tư vấn viên",
    content: "Em gửi giúp anh bảng học phí theo từng học kỳ và điều kiện nhận học bổng 30% nhé.",
    direction: "inbound",
    status: "read",
    conversationTitle: "Hỏi học phí & học bổng",
  },
  {
    id: "zalo-2",
    time: "06/06/2026 · 16:49",
    senderName: mockAssignee,
    senderRole: "Tư vấn viên",
    recipientName: "Nguyễn Văn Minh",
    recipientRole: "Bố của học sinh",
    content: "Dạ được anh. Em gửi bảng phí và thông tin học bổng trong tin nhắn tiếp theo, sau đó mình trao đổi thêm qua cuộc gọi lúc 17:00 nhé.",
    direction: "outbound",
    status: "delivered",
    conversationTitle: "Hỏi học phí & học bổng",
    attachmentName: "Bang-hoc-phi-2026.pdf",
  },
  {
    id: "zalo-3",
    time: "04/06/2026 · 20:18",
    senderName: "Nguyễn Minh An",
    senderRole: "Học sinh",
    recipientName: mockAssignee,
    recipientRole: "Tư vấn viên",
    content: "Em muốn hỏi thêm về các dự án thực tế của ngành Trí tuệ nhân tạo và cơ hội thực tập ạ.",
    direction: "inbound",
    status: "read",
    conversationTitle: "Tìm hiểu ngành học",
  },
];

export const calls: StudentCallRecord[] = [
  {
    id: "call-1",
    time: "06/06/2026 · 16:42",
    direction: "outbound",
    outcome: "connected",
    callerName: mockAssignee,
    callerRole: "Tư vấn viên",
    receiverName: "Nguyễn Văn Minh",
    receiverRole: "Bố của học sinh",
    phoneNumber: "0901 234 412",
    durationSeconds: 412,
    topic: "Tư vấn lần 2",
    summary: "Đã xác nhận ngành phù hợp; phụ huynh cần thêm phương án học phí và học bổng theo học kỳ.",
  },
  {
    id: "call-2",
    time: "03/06/2026 · 10:12",
    direction: "inbound",
    outcome: "connected",
    callerName: "Nguyễn Minh An",
    callerRole: "Học sinh",
    receiverName: mockAssignee,
    receiverRole: "Tư vấn viên",
    phoneNumber: "0901 234 412",
    durationSeconds: 186,
    topic: "Hỏi về ngành AI",
    summary: "Trao đổi về chương trình học, dự án thực tế và lộ trình nghề nghiệp sau tốt nghiệp.",
  },
  {
    id: "call-3",
    time: "01/06/2026 · 14:05",
    direction: "outbound",
    outcome: "no-answer",
    callerName: mockAssignee,
    callerRole: "Tư vấn viên",
    receiverName: "Nguyễn Văn Minh",
    receiverRole: "Bố của học sinh",
    phoneNumber: "0901 234 412",
    durationSeconds: 0,
    topic: "Xác nhận lịch tư vấn",
    summary: "Không bắt máy. Đã để lại lời nhắn và hẹn gọi lại vào khung giờ 16:00–18:00.",
  },
];
