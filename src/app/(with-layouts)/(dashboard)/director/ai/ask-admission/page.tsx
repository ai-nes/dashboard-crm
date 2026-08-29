import type { Metadata } from "next";

import DirectorWorkspacePage from "../../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Hỏi đáp tuyển sinh AI",
  description: "Đặt câu hỏi bằng tiếng Việt trên dữ liệu tuyển sinh trong phạm vi quyền truy cập.",
};

export default function AskAdmissionAiPage() {
  return (
    <DirectorWorkspacePage
      code="M-15"
      title="Ask Admission AI"
      description="Hỏi bằng tiếng Việt trên dữ liệu tuyển sinh, nhận câu trả lời có số liệu, nguồn đã dùng và phạm vi thời gian rõ ràng."
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
            { label: "Vì sao conversion tuần này giảm?", detail: "Phân rã theo vùng, nguồn hồ sơ và tuổi pipeline", value: "Gợi ý", tone: "primary" },
            { label: "Tôi cần xử lý gì hôm nay?", detail: "Tổng hợp từ SLA, pipeline và tín hiệu AI", value: "Gợi ý", tone: "success" },
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
            { label: "Market Intelligence", detail: "Dữ liệu lead theo tỉnh và quy mô thị trường", value: "1.978 bản ghi", tone: "primary" },
            { label: "Admission Funnel", detail: "Các bước chuyển đổi và điểm rò rỉ", value: "22.890 hồ sơ", tone: "primary" },
            { label: "Student 360", detail: "Tín hiệu hành trình và lịch sử tương tác", value: "8.400 hồ sơ", tone: "success" },
          ],
        },
      ]}
      notice="Màn hình này mới là khung trải nghiệm; cần xác định quyền dữ liệu, cách trích nguồn và cơ chế từ chối trả lời trước khi kết nối model."
    />
  );
}
