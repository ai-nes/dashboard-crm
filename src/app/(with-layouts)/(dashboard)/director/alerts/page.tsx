import type { Metadata } from "next";

import DirectorWorkspacePage from "../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Cảnh báo & đăng ký nhận tin",
  description: "Cấu hình ngưỡng cảnh báo, kênh nhận và báo cáo định kỳ.",
};

export default function AlertsSubscriptionsPage() {
  return (
    <DirectorWorkspacePage
      code="M-18"
      title="Cảnh báo và lịch nhận tin"
      description="Gửi tín hiệu quan trọng đến đúng người theo ngưỡng cảnh báo, kênh nhận và lịch báo cáo."
      metrics={[
        { label: "Quy tắc đang bật", value: "8", detail: "Theo dõi hạn xử lý, tỷ lệ chuyển đổi và doanh thu", tone: "primary" },
        { label: "Cảnh báo hôm nay", value: "14", detail: "3 cảnh báo mức độ cao", tone: "warning" },
        { label: "Báo cáo định kỳ", value: "4", detail: "Gửi theo ngày hoặc theo tuần", tone: "success" },
        { label: "Người nhận hoạt động", value: "27", detail: "Theo vai trò và khu vực phụ trách", tone: "success" },
      ]}
      sections={[
        {
          title: "Quy tắc cảnh báo",
          description: "Các điều kiện đang gửi cảnh báo tới người dùng.",
          items: [
            { label: "Hồ sơ quá hạn xử lý 4 giờ", detail: "Gửi cho quản lý phụ trách và trưởng khu vực", value: "Bật", tone: "error" },
            { label: "Tỷ lệ chuyển đổi giảm trên 10%", detail: "Gửi bản tóm tắt vào đầu ngày làm việc", value: "Bật", tone: "warning" },
            { label: "Dự báo doanh thu chênh lệch so với chỉ tiêu", detail: "Gửi cho giám đốc và nhóm tài chính", value: "Bật", tone: "primary" },
          ],
        },
        {
          title: "Kênh nhận & lịch gửi",
          description: "Kiểm soát tần suất để cảnh báo luôn hữu ích và kịp thời.",
          items: [
            { label: "Trong ứng dụng", detail: "Dùng cho cảnh báo cần xử lý ngay", value: "14 hôm nay", tone: "primary" },
            { label: "Email tóm tắt", detail: "Gửi lúc 08:00 cho nhóm quản lý", value: "Đang bật", tone: "success" },
            { label: "Báo cáo tuần", detail: "Gửi thứ Hai với các xu hướng và ngoại lệ", value: "4 lịch", tone: "success" },
          ],
        },
        {
          title: "Lịch sử cảnh báo",
          description: "Theo dõi cảnh báo đã gửi, đã xem và đã xử lý.",
          items: [
            { label: "Đã xử lý", detail: "Có hành động hoặc ghi nhận lý do đóng", value: "82%", tone: "success" },
            { label: "Đang chờ", detail: "Chưa có người nhận hoặc chưa mở", value: "11%", tone: "warning" },
            { label: "Bị bỏ qua", detail: "Cần review để tránh cảnh báo không hữu ích", value: "7%", tone: "error" },
          ],
        },
      ]}
      notice="Chỉ kết nối kênh gửi thực tế sau khi chốt phân quyền theo vai trò và chính sách nhận thông báo."
    />
  );
}
