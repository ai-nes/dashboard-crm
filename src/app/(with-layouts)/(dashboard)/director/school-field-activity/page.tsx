import type { Metadata } from "next";

import DirectorWorkspacePage from "../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Hoạt động trường & thực địa",
  description: "Đo hiệu quả hoạt động thực địa, độ phủ trường và chất lượng dữ liệu.",
};

export default function SchoolFieldActivityPage() {
  return (
    <DirectorWorkspacePage
      code="M-11"
      title="School & Field Activity"
      description="Theo dõi hiệu quả từng hoạt động tại trường, lập kế hoạch thực địa và kiểm soát chất lượng dữ liệu thu về."
      metrics={[
        { label: "Hoạt động mùa này", value: "148", detail: "Ghé trường, hội thảo và tư vấn", tone: "primary" },
        { label: "Trường đã phủ", value: "86", detail: "Trên tổng số 112 trường ưu tiên", tone: "success" },
        { label: "Hồ sơ từ thực địa", value: "3.420", detail: "Tỷ lệ chuyển đổi 24,8%", tone: "success" },
        { label: "Dữ liệu hợp lệ", value: "94,8%", detail: "Tăng 1,7 điểm trong tuần", tone: "warning" },
      ]}
      sections={[
        {
          title: "Hiệu quả từng hoạt động",
          description: "So sánh chi phí, độ phủ và hồ sơ tạo ra.",
          items: [
            { label: "Ngày hội tư vấn", detail: "42 hoạt động · 1.280 hồ sơ · CPL 0,42 triệu", value: "Tốt", tone: "success" },
            { label: "Ghé trường ưu tiên", detail: "68 lượt · 1.640 hồ sơ · tỷ lệ đủ điều kiện 61%", value: "Tốt", tone: "success" },
            { label: "Hội thảo phụ huynh", detail: "38 hoạt động · 500 hồ sơ · cần tối ưu attendance", value: "Theo dõi", tone: "warning" },
          ],
        },
        {
          title: "Kế hoạch sắp tới",
          description: "Gợi ý trường ưu tiên từ Market Intelligence và School Intelligence.",
          items: [
            { label: "THPT Châu Văn Liêm", detail: "Potential 92/100 · application giảm 16%", value: "Tuần này", tone: "error" },
            { label: "Cụm trường Đồng Nai", detail: "Tệp AI tăng 31% · độ phủ hiện chỉ 3,2%", value: "Tuần sau", tone: "warning" },
            { label: "Các trường chưa phủ", detail: "26 trường có quy mô lớp 12 trên 500 học sinh", value: "Lập kế hoạch", tone: "primary" },
          ],
        },
        {
          title: "Đồng bộ thiết bị & chất lượng dữ liệu",
          description: "Theo dõi độ mới và độ đầy đủ của dữ liệu thực địa.",
          items: [
            { label: "Thiết bị đã đồng bộ", detail: "Cập nhật trong 24 giờ gần nhất", value: "42/45", tone: "success" },
            { label: "Bản ghi thiếu tọa độ", detail: "Cần bổ sung để tính độ phủ theo địa bàn", value: "86", tone: "warning" },
            { label: "Bản ghi lỗi định dạng", detail: "Đang chờ đội vận hành xác nhận", value: "19", tone: "error" },
          ],
        },
      ]}
      notice="Kết nối lịch hoạt động, thiết bị và dữ liệu trường là bước tiếp theo của màn hình này."
    />
  );
}
