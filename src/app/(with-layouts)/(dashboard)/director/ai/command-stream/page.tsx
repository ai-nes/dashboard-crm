import type { Metadata } from "next";

import DirectorWorkspacePage from "../../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Luồng tín hiệu AI",
  description: "Dòng phát hiện AI theo thời gian và khả năng truy ngược về đối tượng nguồn.",
};

export default function AiCommandStreamPage() {
  return (
    <DirectorWorkspacePage
      code="M-14"
      title="Luồng tín hiệu AI"
      description="Theo dõi tín hiệu mới, độ tin cậy, trạng thái xử lý và nguồn tạo tín hiệu."
      metrics={[
        { label: "Phát hiện hôm nay", value: "37", detail: "Từ 12 nguồn dữ liệu", tone: "primary" },
        { label: "Đang chờ xử lý", value: "12", detail: "5 phát hiện mức độ cao", tone: "warning" },
        { label: "Độ tin cậy trung vị", value: "87%", detail: "Trên các phát hiện đã đánh giá", tone: "success" },
        { label: "Nguồn bị gián đoạn", value: "1", detail: "Đang chuyển sang chế độ dự phòng", tone: "error" },
      ]}
      sections={[
        {
          title: "Dòng phát hiện",
          description: "Các tín hiệu mới nhất cần người dùng xem hoặc phê duyệt.",
          items: [
            { label: "Hồ sơ Nguyễn Minh A. có khả năng nhập học cao", detail: "Nguồn: Hồ sơ học sinh 360° · phát hiện 4 phút trước", value: "87%", tone: "success" },
            { label: "Độ phủ tại Cần Thơ thấp hơn tiềm năng", detail: "Nguồn: Phân tích thị trường · phát hiện 18 phút trước", value: "91%", tone: "warning" },
            { label: "Khu vực Mekong có dấu hiệu quá tải", detail: "Nguồn: Hiệu suất khu vực · phát hiện 31 phút trước", value: "84%", tone: "error" },
          ],
        },
        {
          title: "Phân bố loại phát hiện",
          description: "Nhóm phát hiện đang được AI tạo ra trong mùa tuyển sinh.",
          items: [
            { label: "Cơ hội chuyển đổi", detail: "Tín hiệu giúp ưu tiên hồ sơ có khả năng nhập học", value: "46%", tone: "success" },
            { label: "Rủi ro vận hành", detail: "SLA, tải đội ngũ hoặc dữ liệu bất thường", value: "32%", tone: "error" },
            { label: "Cơ hội thị trường", detail: "Địa bàn, trường và phân khúc mới nổi", value: "22%", tone: "primary" },
          ],
        },
        {
          title: "Khi lớp AI ngừng hoạt động",
          description: "Trạng thái dự phòng và khả năng tiếp tục vận hành.",
          items: [
            { label: "Hiển thị dữ liệu gốc", detail: "Người dùng vẫn xem được bản ghi và bộ lọc hiện tại", value: "Sẵn sàng", tone: "success" },
            { label: "Dừng đề xuất mới", detail: "Không tự động tạo hành động khi thiếu model", value: "Đang áp dụng", tone: "warning" },
            { label: "Ghi nhật ký sự cố", detail: "Lưu thời điểm, phạm vi ảnh hưởng và nguồn lỗi", value: "Bật", tone: "primary" },
          ],
        },
      ]}
      notice="Luồng tín hiệu cần có cơ chế cập nhật thời gian thực, xử lý lại dữ liệu và nhật ký kiểm tra trước khi đưa vào vận hành."
    />
  );
}
