import type { Metadata } from "next";

import DirectorWorkspacePage from "../_components/director-workspace-page";

export const metadata: Metadata = {
  title: "Chất lượng dữ liệu và nguồn",
  description: "Theo dõi tình trạng nguồn dữ liệu, thời điểm cập nhật và chất lượng bản ghi.",
};

export default function DataHealthPage() {
  return (
    <DirectorWorkspacePage
      code="M-17"
      title="Chất lượng dữ liệu và nguồn"
      description="Kiểm tra dữ liệu đã đầy đủ chưa, nguồn nào cập nhật chậm và chỉ số nào cần lưu ý trước khi dùng để ra quyết định."
      metrics={[]}
      sections={[]}
      notice="Cần cấu hình nguồn dữ liệu chính thức, lịch đồng bộ và quy tắc kiểm tra chất lượng trước khi vận hành."
    />
  );
}
