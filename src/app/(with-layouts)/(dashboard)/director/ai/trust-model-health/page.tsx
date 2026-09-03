import type { Metadata } from "next";

import DirectorWorkspacePage from "../../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Độ tin cậy của AI",
  description: "Theo dõi độ chính xác dự báo, mức hiệu chuẩn và chất lượng dữ liệu AI sử dụng.",
};

export default function AiTrustModelHealthPage() {
  return (
    <DirectorWorkspacePage
      code="M-16"
      title="Độ tin cậy của AI"
      description="Kiểm tra độ tin cậy của dự báo và đề xuất AI, từ mức hiệu chuẩn đến chất lượng nguồn dữ liệu."
      metrics={[
        { label: "Điểm hiệu chuẩn", value: "0,91", detail: "Mức khớp giữa xác suất dự báo và kết quả thực tế", tone: "success" },
        { label: "Đề xuất được chấp nhận", value: "78%", detail: "Trong các đề xuất đã có phản hồi", tone: "primary" },
        { label: "Phát hiện rủi ro cao", value: "6%", detail: "Cần người quản trị xem lại", tone: "error" },
        { label: "Nguồn dữ liệu đạt yêu cầu", value: "92%", detail: "Cập nhật đúng hạn và không có lỗi kiểm tra", tone: "success" },
      ]}
      sections={[
        {
          title: "Hiệu chuẩn xác suất",
          description: "So sánh xác suất AI dự báo với kết quả quan sát được.",
          items: [
            { label: "Nhóm xác suất 80-100%", detail: "Tỷ lệ nhập học thực tế đang bám sát dự báo", value: "91%", tone: "success" },
            { label: "Nhóm xác suất 50-80%", detail: "Kết quả cho thấy dự báo đang cao hơn thực tế", value: "84%", tone: "warning" },
            { label: "Nhóm xác suất dưới 50%", detail: "Cần thêm dữ liệu để đánh giá ổn định", value: "Đang đo", tone: "primary" },
          ],
        },
        {
          title: "Chất lượng tri thức",
          description: "Tính đầy đủ, mới và khả năng truy nguồn của dữ liệu AI dùng.",
          items: [
            { label: "Nguồn có timestamp", detail: "Mọi dữ liệu đều có thời điểm cập nhật", value: "98%", tone: "success" },
            { label: "Nguồn quá hạn cập nhật", detail: "Có thể ảnh hưởng tới câu trả lời và đề xuất", value: "3", tone: "warning" },
            { label: "Bản ghi không truy nguồn", detail: "Không được dùng cho quyết định tự động", value: "0,6%", tone: "error" },
          ],
        },
        {
          title: "Phân bố mức rủi ro",
          description: "Giới hạn hành động tự động theo mức độ ảnh hưởng.",
          items: [
            { label: "Rủi ro thấp", detail: "Có thể gợi ý, người dùng quyết định", value: "71%", tone: "success" },
            { label: "Rủi ro trung bình", detail: "Cần hiển thị lý do và nguồn bằng chứng", value: "23%", tone: "warning" },
            { label: "Rủi ro cao", detail: "Bắt buộc phê duyệt trước khi thực hiện", value: "6%", tone: "error" },
          ],
        },
      ]}
      notice="Chỉ sử dụng các chỉ số này để giám sát AI khi đã có kết quả thực tế và quy trình đánh giá định kỳ."
    />
  );
}
