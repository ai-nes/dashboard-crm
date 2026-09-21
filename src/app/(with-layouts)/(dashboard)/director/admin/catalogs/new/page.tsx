import type { Metadata } from "next";

import ScoreTemplateDetailPage from "@/components/admin/admin-catalog/score-template-detail-page";

export const metadata: Metadata = {
  title: "Thêm Score Template",
  description: "Tạo mẫu chấm điểm mới cho cấu hình điểm tiềm năng.",
};

export default function NewScoreTemplatePage() {
  return <ScoreTemplateDetailPage />;
}
