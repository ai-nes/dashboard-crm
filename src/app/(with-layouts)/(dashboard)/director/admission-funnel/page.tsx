import type { Metadata } from "next";

import DirectorWorkspacePage from "../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Phễu tuyển sinh",
  description: "Theo dõi bảy bước từ hồ sơ tiềm năng đến nhập học và các điểm rò rỉ.",
};

export default function AdmissionFunnelPage() {
  return (
    <DirectorWorkspacePage
      code="M-05"
      title="Phễu tuyển sinh"
      description="Xem toàn bộ hành trình bảy bước, xác định điểm rò rỉ và ưu tiên nơi cần cải thiện để tăng số hồ sơ nhập học."
      metrics={[
        { label: "Hồ sơ tiềm năng", value: "24.860", detail: "Từ đầu mùa 2026", tone: "primary" },
        { label: "Tỷ lệ chuyển đổi", value: "18,4%", detail: "Tăng 2,1 điểm so với kỳ trước", tone: "success" },
        { label: "Điểm rò rỉ lớn nhất", value: "Tư vấn → Đăng ký", detail: "Giảm 8,6% trong 14 ngày", tone: "error" },
        { label: "Hồ sơ cần can thiệp", value: "1.284", detail: "Có tín hiệu nhưng chưa tiến bước", tone: "warning" },
      ]}
      sections={[
        {
          title: "Phễu bảy bước",
          description: "Khối lượng và tỷ lệ chuyển tiếp qua từng giai đoạn.",
          items: [
            { label: "Tiếp cận", detail: "Tổng số người học đã được tiếp cận", value: "42.800", tone: "primary" },
            { label: "Quan tâm", detail: "Có ít nhất một tín hiệu tương tác", value: "31.240", tone: "primary" },
            { label: "Đăng ký", detail: "Đã để lại thông tin tư vấn", value: "22.890", tone: "success" },
            { label: "Nhập học", detail: "Đã hoàn tất bước xác nhận", value: "4.820", tone: "success" },
          ],
        },
        {
          title: "Phân tích điểm rò rỉ",
          description: "Các nguyên nhân đang ảnh hưởng trực tiếp tới chuyển đổi.",
          items: [
            { label: "SLA phản hồi", detail: "22.890 hồ sơ đang chờ được phản hồi đúng hạn", value: "Cần xem", tone: "error" },
            { label: "Theo sát hồ sơ", detail: "8.400 cuộc hội thoại chưa có bước tiếp theo", value: "Ưu tiên", tone: "warning" },
            { label: "Hiệu quả campaign", detail: "Một số nguồn có nhiều lead nhưng ít nhập học", value: "Phân tích", tone: "primary" },
          ],
        },
        {
          title: "Tồn đọng theo tuổi hồ sơ",
          description: "Ưu tiên xử lý những hồ sơ sắp mất cơ hội.",
          items: [
            { label: "Dưới 4 giờ", detail: "Trong ngưỡng cam kết phản hồi", value: "7.420", tone: "success" },
            { label: "4–24 giờ", detail: "Cần theo dõi trong ca hiện tại", value: "2.180", tone: "warning" },
            { label: "Trên 24 giờ", detail: "Đã vi phạm SLA hoặc có nguy cơ rời phễu", value: "648", tone: "error" },
          ],
        },
      ]}
      notice="Đây là khung màn hình M-05. Các biểu đồ chi tiết và dữ liệu nguồn sẽ được nối vào sau khi chốt API phễu tuyển sinh."
    />
  );
}
