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
      metrics={[]}
      sections={[]}
      notice="Tính năng chỉ nên được kết nối sau khi chốt quyền dữ liệu, cách trích nguồn và quy tắc từ chối trả lời."
    />
  );
}
