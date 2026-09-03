import type { Metadata } from "next";

import DirectorWorkspacePage from "../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Chất lượng dữ liệu và nguồn",
  description: "Theo dõi tình trạng nguồn dữ liệu, thời điểm cập nhật và chất lượng bản ghi.",
};

export default function DataHealthPage() {
  return (
    <DirectorWorkspacePage
      code="M-17"
      title="Chất lượng dữ liệu và nguồn"
      description="Kiểm tra dữ liệu đã đầy đủ chưa, nguồn nào cập nhật chậm và chỉ số nào cần lưu ý trước khi dùng để ra quyết định."
      metrics={[
        { label: "Nguồn dữ liệu", value: "12", detail: "Đang được theo dõi", tone: "primary" },
        { label: "Nguồn đạt yêu cầu", value: "9", detail: "Cập nhật đúng hạn và đã qua kiểm tra chất lượng", tone: "success" },
        { label: "Nguồn cần xem", value: "3", detail: "Trễ, thiếu hoặc lỗi định dạng", tone: "warning" },
        { label: "Bản ghi lỗi", value: "214", detail: "0,8% tổng dữ liệu đầu vào", tone: "error" },
      ]}
      sections={[
        {
          title: "Trạng thái nguồn dữ liệu",
          description: "Tình trạng đồng bộ và phạm vi màn hình bị ảnh hưởng.",
          items: [
            { label: "CRM / hồ sơ quan tâm", detail: "Đồng bộ 2 phút trước · dùng cho M-05, M-08, M-14", value: "Đạt yêu cầu", tone: "success" },
            { label: "Hoạt động thực địa", detail: "Đồng bộ 11 giờ trước · dùng cho M-11, M-01, M-12", value: "Trễ", tone: "warning" },
            { label: "Mô hình AI và nguồn tri thức", detail: "Đồng bộ 1 ngày trước · dùng cho M-07, M-08, M-14, M-16", value: "Cần xem", tone: "error" },
          ],
        },
        {
          title: "Sổ đăng ký dữ liệu mô phỏng",
          description: "Minh bạch hóa khối nào chưa có nguồn chính thức.",
          items: [
            { label: "Quy mô lớp 12 theo trường", detail: "Đang dùng dữ liệu mô phỏng cho phân tích trường THPT", value: "Mô phỏng", tone: "warning" },
            { label: "Doanh thu dự kiến", detail: "Tính từ chỉ tiêu và tỷ lệ nhập học giả định", value: "Mô phỏng", tone: "warning" },
            { label: "Điểm tiềm năng", detail: "Đã có công thức nhưng chưa kết nối nguồn dữ liệu chính thức", value: "Mô phỏng", tone: "warning" },
          ],
        },
        {
          title: "Kiểm tra chất lượng",
          description: "Các quy tắc áp dụng trước khi dữ liệu được dùng trên màn hình quản trị.",
          items: [
            { label: "Đủ trường bắt buộc", detail: "Kiểm tra mã hồ sơ, nguồn, thời điểm và trạng thái", value: "98,9%", tone: "success" },
            { label: "Không trùng bản ghi", detail: "Phát hiện và gộp các bản ghi trùng khóa", value: "99,4%", tone: "success" },
            { label: "Đúng định dạng", detail: "Còn 214 bản ghi cần đội dữ liệu xử lý", value: "97,8%", tone: "warning" },
          ],
        },
      ]}
      notice="M-17 đánh dấu dữ liệu mô phỏng và mức độ tin cậy. Cần cấu hình nguồn chính thức, lịch đồng bộ và quy tắc kiểm tra chất lượng trước khi vận hành."
    />
  );
}
