import type { Metadata } from "next";

import DirectorWorkspacePage from "../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "SLA & trung tâm rủi ro",
  description: "Theo dõi cam kết phản hồi và các cơ hội tuyển sinh có nguy cơ mất.",
};

export default function SlaRiskCenterPage() {
  return (
    <DirectorWorkspacePage
      code="M-10"
      title="SLA & Risk Center"
      description="Tập trung mọi hồ sơ đang trượt khỏi cam kết, xếp theo mức độ khẩn cấp và tác động tới cơ hội nhập học."
      metrics={[
        { label: "Hồ sơ quá SLA", value: "125", detail: "48% đến từ đội Mekong", tone: "error" },
        { label: "Cơ hội có nguy cơ mất", value: "23", detail: "Không có điểm chạm mới", tone: "warning" },
        { label: "Phản hồi trung vị", value: "4g 18p", detail: "Mục tiêu dưới 4 giờ", tone: "warning" },
        { label: "Đúng SLA", value: "86,2%", detail: "Tăng 3,4 điểm trong tuần", tone: "success" },
      ]}
      sections={[
        {
          title: "Đồng hồ cam kết phản hồi",
          description: "Tình trạng SLA theo mức độ cần xử lý.",
          items: [
            { label: "Đang trong hạn", detail: "Có thể tiếp tục xử lý theo hàng đợi hiện tại", value: "8.420", tone: "success" },
            { label: "Sắp quá hạn", detail: "Còn dưới 60 phút trước mốc cam kết", value: "312", tone: "warning" },
            { label: "Đã quá hạn", detail: "Cần điều phối hoặc escalated ngay", value: "125", tone: "error" },
          ],
        },
        {
          title: "Cơ hội đang mất",
          description: "Hồ sơ có tín hiệu mạnh nhưng đã im lặng quá lâu.",
          items: [
            { label: "Nguyễn T. Hà", detail: "23 ngày không có bước tiếp theo · tiềm năng cao", value: "Khẩn", tone: "error" },
            { label: "Lê M. Anh", detail: "14 ngày chưa phân công tư vấn viên", value: "Khẩn", tone: "error" },
            { label: "Trần Q. Bảo", detail: "11 ngày chưa phản hồi câu hỏi học phí", value: "Cần xem", tone: "warning" },
          ],
        },
        {
          title: "Phân bổ nguyên nhân rủi ro",
          description: "Nhóm nguyên nhân cần can thiệp ở cấp vận hành.",
          items: [
            { label: "Thiếu người phụ trách", detail: "Tập trung ở các đội có tải trên 90%", value: "48%", tone: "warning" },
            { label: "Chưa có bước tiếp theo", detail: "Hồ sơ đã được liên hệ nhưng chưa ghi nhận kết quả", value: "31%", tone: "warning" },
            { label: "Dữ liệu thiếu hoặc trễ", detail: "Nguồn đồng bộ chưa hoàn tất", value: "21%", tone: "primary" },
          ],
        },
      ]}
      notice="Ngưỡng SLA trong màn hình này là dữ liệu mô phỏng; cần chốt theo quy định từng kênh trước khi kết nối cảnh báo thật."
    />
  );
}
