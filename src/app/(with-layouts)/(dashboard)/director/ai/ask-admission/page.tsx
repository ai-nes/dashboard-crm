import type { Metadata } from "next";

import DirectorWorkspacePage from "../../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Trợ lý hỏi đáp tuyển sinh",
  description: "Tra cứu dữ liệu tuyển sinh bằng tiếng Việt trong phạm vi được cấp quyền.",
};

export default function AskAdmissionAiPage() {
  return (
    <DirectorWorkspacePage
      code="M-15"
      title="Trợ lý hỏi đáp tuyển sinh"
      description="Đặt câu hỏi bằng tiếng Việt và nhận câu trả lời kèm số liệu, nguồn tham chiếu và thời gian dữ liệu."
      metrics={[
        { label: "Phiên hỏi đáp", value: "1.248", detail: "Trong 30 ngày gần nhất", tone: "primary" },
        { label: "Câu trả lời có nguồn", value: "96%", detail: "Có thể truy ngược bản ghi", tone: "success" },
        { label: "Câu hỏi chưa trả lời", value: "18", detail: "Cần bổ sung dữ liệu hoặc định nghĩa", tone: "warning" },
        { label: "Thời gian phản hồi", value: "3,2s", detail: "Trung bình mỗi câu hỏi", tone: "success" },
      ]}
      sections={[
        {
          title: "Đặt câu hỏi",
          description: "Các câu hỏi thường dùng cho quyết định tuyển sinh.",
          items: [
            { label: "Khu vực nào còn dư địa tăng trưởng?", detail: "Đối chiếu quy mô thị trường, độ phủ và tỷ lệ nhập học", value: "Gợi ý", tone: "primary" },
            { label: "Vì sao tỷ lệ chuyển đổi tuần này giảm?", detail: "Xem theo khu vực, nguồn hồ sơ và thời gian hồ sơ ở từng bước", value: "Gợi ý", tone: "primary" },
            { label: "Hôm nay cần ưu tiên xử lý việc gì?", detail: "Tổng hợp từ hạn xử lý, tiến độ hồ sơ và tín hiệu AI", value: "Gợi ý", tone: "success" },
          ],
        },
        {
          title: "Câu trả lời & số liệu",
          description: "Mọi câu trả lời cần hiển thị phạm vi và thời điểm dữ liệu.",
          items: [
            { label: "Tóm tắt bằng ngôn ngữ tự nhiên", detail: "Nêu kết luận trước, sau đó là bằng chứng chính", value: "Bắt buộc", tone: "success" },
            { label: "Bộ lọc ngầm được áp dụng", detail: "Năm, kỳ, cơ sở, địa bàn, ngành và kênh", value: "Hiển thị", tone: "primary" },
            { label: "Khoảng tin cậy & cảnh báo", detail: "Nêu rõ khi dữ liệu mô phỏng, thiếu hoặc đã cũ", value: "Hiển thị", tone: "warning" },
          ],
        },
        {
          title: "Nguồn đã dùng",
          description: "Liên kết từ câu trả lời về màn hình hoặc bản ghi gốc.",
          items: [
            { label: "Phân tích thị trường", detail: "Dữ liệu hồ sơ theo tỉnh và quy mô thị trường", value: "1.978 bản ghi", tone: "primary" },
            { label: "Phễu tuyển sinh", detail: "Các bước chuyển đổi và điểm cần cải thiện", value: "22.890 hồ sơ", tone: "primary" },
            { label: "Hồ sơ học sinh 360°", detail: "Tín hiệu hành trình và lịch sử tương tác", value: "8.400 hồ sơ", tone: "success" },
          ],
        },
      ]}
      notice="Tính năng chỉ nên được kết nối sau khi chốt quyền dữ liệu, cách trích nguồn và quy tắc từ chối trả lời."
    />
  );
}
