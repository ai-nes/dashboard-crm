import type { Student360Data } from "./types";

export const student360Data: Student360Data = {
  student: {
    initials: "MA",
    name: "Nguyễn Minh An",
    code: "HS-2026-104589",
    school: "THPT Chu Văn An, Hà Nội",
    grade: "Lớp 12",
    major: "AI / Computer Science",
    phone: "0901 234 567",
    email: "minhan.nguyen@email.com",
    province: "Hà Nội",
    counselor: "Trần Minh Quân",
  },
  readiness: [
    { label: "Hồ sơ", value: 80, tone: "success", detail: "Đầy đủ cơ bản" },
    { label: "Gia đình", value: 60, tone: "warning", detail: "Cần trao đổi thêm" },
    { label: "Tương tác", value: 72, tone: "success", detail: "Có tín hiệu tốt" },
  ],
  profile: [
    { label: "Ngày sinh", value: "20/07/2007" }, { label: "Giới tính", value: "Nữ" },
    { label: "Khu vực", value: "Cầu Giấy, Hà Nội" }, { label: "Nguồn", value: "Website tuyển sinh" },
  ],
  academics: [
    { label: "GPA lớp 11", value: "8.7 / 10" }, { label: "Tiếng Anh", value: "IELTS 6.5" },
    { label: "Điểm mạnh", value: "Toán, Tin học" }, { label: "Sở thích", value: "AI, lập trình, robotics" },
  ],
  family: [
    { label: "Người liên hệ chính", value: "Nguyễn Thị Lệ · Mẹ" }, { label: "Vai trò quyết định", value: "Ảnh hưởng cao", emphasis: true },
    { label: "Mối quan tâm", value: "Học phí và học bổng", emphasis: true }, { label: "Kênh phù hợp", value: "Zalo, cuộc gọi buổi tối" },
  ],
  insight: {
    summary: "Minh An có nền tảng học tập tốt và đã chủ động tìm hiểu chương trình AI. Rào cản chính là chi phí; mẹ là người có ảnh hưởng lớn đến quyết định.",
    probability: 82,
    concern: "Học phí & học bổng",
    decisionMaker: "Mẹ · ảnh hưởng cao",
    evidence: ["Xem trang học bổng 3 lần trong 7 ngày", "Tham gia Open Day và tải brochure ngành AI", "Phản hồi tích cực sau cuộc gọi tư vấn"],
    recommendation: "Đặt lịch tư vấn học phí và học bổng cùng phụ huynh trong 3 ngày tới.",
  },
  journey: [
    { id: "ad", date: "10/08", title: "TikTok Ad", description: "Đăng ký nhận tư vấn ngành AI", channel: "Website", status: "completed" },
    { id: "visit", date: "12/08", title: "Khám phá chương trình", description: "Xem chương trình AI và học bổng", channel: "Website", status: "completed" },
    { id: "open-day", date: "14/08", title: "Tham gia Open Day", description: "Check-in sự kiện tại campus", channel: "Sự kiện", status: "completed" },
    { id: "call", date: "16/08", title: "Tư vấn ban đầu", description: "Quan tâm học phí và cơ hội học bổng", channel: "Cuộc gọi", status: "completed" },
    { id: "next", date: "Tiếp theo", title: "Tư vấn cùng phụ huynh", description: "Giải đáp học phí, phương án học bổng", channel: "Zalo", status: "current" },
  ],
  engagement: [
    { label: "Website & landing page", value: "12 lượt truy cập / 30 ngày", level: "Cao" },
    { label: "Sự kiện", value: "Open Day · đã tham gia", level: "Cao" },
    { label: "Email", value: "Mở 4/5 email gần nhất", level: "Cao" },
    { label: "Zalo & cuộc gọi", value: "Phản hồi trong 1 ngày", level: "Trung bình" },
  ],
  application: [
    { label: "Nguyện vọng", value: "AI / Computer Science", status: "primary" },
    { label: "Kỳ tuyển sinh", value: "Fall 2026" },
    { label: "Trạng thái hồ sơ", value: "Chưa bắt đầu", status: "warning" },
    { label: "Học bổng", value: "Đủ điều kiện tham vấn", status: "success" },
  ],
};
