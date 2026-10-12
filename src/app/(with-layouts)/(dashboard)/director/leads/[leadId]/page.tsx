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
  searchParams: Promise<{ edit?: string }>;
}) {
  const { leadId } = await params;
  const { edit } = await searchParams;
  return (
    <LeadDetailDashboard
      leadId={leadId}
      initialEditContact={edit === "contact"}
    />
  );
}
