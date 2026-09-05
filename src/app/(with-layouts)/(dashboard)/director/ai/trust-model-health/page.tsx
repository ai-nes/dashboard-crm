import type { Metadata } from "next";

import DirectorWorkspacePage from "../../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Độ tin cậy của AI",
  description: "Theo dõi độ chính xác dự báo, mức hiệu chuẩn và chất lượng dữ liệu AI sử dụng.",
};

export default function AiTrustModelHealthPage() {
  return (
    <DirectorWorkspacePage
      code="M-16"
      title="Độ tin cậy của AI"
      description="Kiểm tra độ tin cậy của dự báo và đề xuất AI, từ mức hiệu chuẩn đến chất lượng nguồn dữ liệu."
      metrics={[]}
      sections={[]}
      notice="Chỉ sử dụng các chỉ số này để giám sát AI khi đã có kết quả thực tế và quy trình đánh giá định kỳ."
    />
  );
}
