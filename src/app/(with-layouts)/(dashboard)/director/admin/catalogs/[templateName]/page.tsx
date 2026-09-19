import type { Metadata } from "next";

import ScoreTemplateDetailPage from "@/components/admin/admin-catalog/score-template-detail-page";

export const metadata: Metadata = {
  title: "Chi tiết Score Template",
  description: "Xem và cập nhật cấu hình điểm tiềm năng.",
};

export default async function ScoreTemplateDetailRoute({
  params,
}: {
  params: Promise<{ templateName: string }>;
}) {
  const { templateName } = await params;
  return (
    <ScoreTemplateDetailPage templateName={decodeURIComponent(templateName)} />
  );
}
