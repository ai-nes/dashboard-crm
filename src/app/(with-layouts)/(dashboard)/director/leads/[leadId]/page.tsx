import type { Metadata } from "next";

import LeadDetailDashboard from "../_components/lead-detail-dashboard";

export const metadata: Metadata = {
  title: "Chi tiết lead",
  description: "Thông tin chi tiết, ghi chú và nhật ký chăm sóc của lead.",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  return <LeadDetailDashboard leadId={leadId} />;
}
