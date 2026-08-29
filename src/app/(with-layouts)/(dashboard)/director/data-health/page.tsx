import type { Metadata } from "next";

import DirectorWorkspacePage from "../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Sức khỏe dữ liệu & nguồn",
  description: "Theo dõi trạng thái nguồn dữ liệu, độ mới và chất lượng bản ghi.",
};

export default function DataHealthPage() {
  return (
    <DirectorWorkspacePage
      code="M-17"
      title="Data Health & Sources"
      description="Biết dữ liệu đã về đủ chưa, nguồn nào đang trễ và chỉ số nào cần được đánh dấu trước khi dùng để quyết định."
      metrics={[
        { label: "Nguồn dữ liệu", value: "12", detail: "Đang được theo dõi", tone: "primary" },
        { label: "Nguồn khỏe", value: "9", detail: "Đúng hạn và đạt quality check", tone: "success" },
        { label: "Nguồn cần xem", value: "3", detail: "Trễ, thiếu hoặc lỗi định dạng", tone: "warning" },
        { label: "Bản ghi lỗi", value: "214", detail: "0,8% tổng dữ liệu đầu vào", tone: "error" },
      ]}
      sections={[
        {
          title: "Trạng thái nguồn dữ liệu",
          description: "Tình trạng đồng bộ và phạm vi màn hình bị ảnh hưởng.",
          items: [
            { label: "CRM / Lead", detail: "Đồng bộ 2 phút trước · dùng cho M-05, M-06, M-08, M-14", value: "Khỏe", tone: "success" },
            { label: "Hoạt động thực địa", detail: "Đồng bộ 11 giờ trước · dùng cho M-11, M-01, M-12", value: "Trễ", tone: "warning" },
            { label: "Model & Knowledge", detail: "Đồng bộ 1 ngày trước · dùng cho M-07, M-08, M-14, M-16", value: "Cần xem", tone: "error" },
          ],
        },
        {
          title: "Sổ đăng ký dữ liệu mô phỏng",
          description: "Minh bạch hóa khối nào chưa có nguồn chính thức.",
          items: [
            { label: "Quy mô lớp 12 theo trường", detail: "Đang dùng dữ liệu mô phỏng để dựng School Intelligence", value: "Mô phỏng", tone: "warning" },
            { label: "Doanh thu dự kiến", detail: "Tính từ target và tỷ lệ nhập học giả lập", value: "Mô phỏng", tone: "warning" },
            { label: "Điểm potential", detail: "Công thức đã có nhưng chưa nối nguồn chính thức", value: "Mô phỏng", tone: "warning" },
          ],
        },
        {
          title: "Kiểm tra chất lượng",
          description: "Các quy tắc trước khi dữ liệu được đưa vào dashboard.",
          items: [
            { label: "Đủ trường bắt buộc", detail: "Kiểm tra mã hồ sơ, nguồn, thời điểm và trạng thái", value: "98,9%", tone: "success" },
            { label: "Không trùng bản ghi", detail: "Phát hiện và gộp các bản ghi trùng khóa", value: "99,4%", tone: "success" },
            { label: "Đúng định dạng", detail: "Còn 214 bản ghi cần đội dữ liệu xử lý", value: "97,8%", tone: "warning" },
          ],
        },
      ]}
      notice="M-17 là nơi đánh dấu dữ liệu mô phỏng và độ tin cậy. Các nguồn thật, lịch đồng bộ và quy tắc quality check cần được cấu hình sau."
    />
  );
}
