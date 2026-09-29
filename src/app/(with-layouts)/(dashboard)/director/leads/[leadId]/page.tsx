import type { Metadata } from "next";

import LeadDetailDashboard from "../_components/lead-detail-dashboard";

export const metadata: Metadata = {
  title: "Chi tiết lead",
  description: "Thông tin chi tiết, ghi chú và nhật ký chăm sóc của lead.",
};

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { leadId } = await params;
  const { returnTo } = await searchParams;
  return <LeadDetailDashboard leadId={leadId} returnTo={returnTo} />;
}
