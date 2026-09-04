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
      metrics={[]}
      sections={[]}
      notice="Luồng tín hiệu cần có cơ chế cập nhật thời gian thực, xử lý lại dữ liệu và nhật ký kiểm tra trước khi đưa vào vận hành."
    />
  );
}
