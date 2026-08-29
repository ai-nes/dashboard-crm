import type { Metadata } from "next";

import DirectorWorkspacePage from "../../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Độ tin cậy & sức khỏe AI",
  description: "Đo độ tin cậy, hiệu chuẩn xác suất và chất lượng tri thức của AI.",
};

export default function AiTrustModelHealthPage() {
  return (
    <DirectorWorkspacePage
      code="M-16"
      title="AI Trust & Model Health"
      description="Kiểm tra xem các dự báo và đề xuất AI có đáng tin hay không, từ độ chuẩn xác đến chất lượng nguồn tri thức."
      metrics={[
        { label: "Calibration score", value: "0,91", detail: "Độ khớp giữa xác suất và kết quả thật", tone: "success" },
        { label: "Đề xuất được chấp nhận", value: "78%", detail: "Trong các đề xuất đã có phản hồi", tone: "primary" },
        { label: "Phát hiện rủi ro cao", value: "6%", detail: "Cần người quản trị xem lại", tone: "error" },
        { label: "Nguồn tri thức khỏe", value: "92%", detail: "Đủ mới và không có lỗi kiểm tra", tone: "success" },
      ]}
      sections={[
        {
          title: "Hiệu chuẩn xác suất",
          description: "So sánh xác suất AI dự báo với kết quả quan sát được.",
          items: [
            { label: "Nhóm xác suất 80–100%", detail: "Tỷ lệ nhập học thật đang bám sát dự báo", value: "91%", tone: "success" },
            { label: "Nhóm xác suất 50–80%", detail: "Có xu hướng dự báo cao hơn kết quả thật", value: "84%", tone: "warning" },
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
      notice="Các chỉ số M-16 chỉ nên dùng để giám sát model sau khi có nhãn kết quả thật và quy trình đánh giá định kỳ."
    />
  );
}
